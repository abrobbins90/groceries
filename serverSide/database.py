from mongo import Mongo
import re
import datetime

class DB:
	""" This class holds on direct functionality for maintaining and processing
	the recipe database. It receives requests and interacts with the Mongo database
	client"""

	def __init__(self):
		self.mongo = Mongo("groceries")
		self.user = "" # Note, before any operations can continue, a user must be specified


	### User Operations

	def user_login(self, userData):
		""" Check credentials. If correct, login the user. Otherwise, reject """
		# Check if username in userdata is valid
		if not self.user_query(userData):
			return False

		# Check if passwords match
		userList = self.mongo.findOne("admin", { "_id", "users"})
		userPassTry = userData["password"]
		userPass = userList[username]
		if userPassTry == userPass:
			self.user = username
			return True
		else:
			return False

	def user_query(self, userData):
		""" Compare provided userData to database to see if user exists """
		# First check if username is valid
		username = userData["username"]
		if not self.is_valid_username(username):
			return False
		# See if username exists
		if self.is_user(username):
			return True
		else:
			return False

	def add_user(self, userData):
		""" Add a new user and password """
		# First ensure username is available
		# Check if username in userdata is valid
		if not self.user_query(userData):
			return False

		# Add username and password
		username = userData["username"]
		userPass = userData["password"]
		self.mongo.update("admin", { "_id", "users"}, {"$set", {"u_" + username: userPass}})

		# Now must also add a new collection to the database for this user
		accountInfo = {}
		accountInfo["_id"] = "account_info"
		accountInfo["username"] = username
		# Add time account was created
		now = (datetime.datetime.utcnow() - datetime.datetime(1970, 1, 1)).total_seconds() # seconds since epoch
		accountInfo["account-created"] = now
		accountInfo["groups"] = []

		collection = "u_" + username
		self.mongo.insertOne(collection, accountInfo)

		return True

	# Internal helper functions
	def is_valid_username(self, username):
		""" Determine if username string is valid """
		if not isinstance(username, str):
			return False
		if username == "":
			return False
		# Make sure only letters, underscore, and numbers in username
		if not re.match('\A\w+\Z', username):
			return False
		return True

	def is_user(self, username):
		""" Determine if user name is in database """
		userList = self.mongo.findOne("admin", { "_id", "users"})
		if username in userList:
			return True
		else:
			return False

	###

	def load(self):
		""" read data for user and send back as a dictionary """


	def add_node(self, userData):
		""" add a node to the database """
		# userData should be a dictionary with the following fields:
		#	- name : shown name for the node
		#	- type : what type of node this is
		#	- id   : unique id for the node (generally <type>_<trimmed name>)

		dictAdd = {
			# what is the usefulness of the "id_" as part of the id string?
			"_id": "id_" + userData["id"],
			"name": userData["showName"],
			"type": userData["type"],
			"edges": [],
		}
		self.mongo.insertOne("u_" + self.username, dictAdd)

		return True

	def add_edge(self, userData):
		""" add an edge between two nodes based on their IDs """
		# userData should be a dictionary with the following fields:
		#	- id1 : id for node 1
		#	- id2 : id for node 2
		id1 = "id_" + userData["id1"]
		id2 = "id_" + userData["id2"]
		self.mongo.update("u_" + self.username, {"_id": id1},
			{ "$addToSet": {"edges": userData["id2"]}})
		self.mongo.update("u_" + self.username, {"_id": id2},
			{ "$addToSet": {"edges": userData["id1"]}})

		return True

	def remove_node(self, userData):
		""" remove the specified node """
		# userData should be a dictionary with the following fields:
		#	- id : id for the node to be deleted

		# is the purpose of this method to remove one node or more than one node?
		self.mongo.deleteMany("u_" + self.username, {"_id": "id_" + userData["id"]})
		return True





