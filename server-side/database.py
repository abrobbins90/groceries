import re
import datetime

from passlib.hash import argon2

from mongo import Mongo

class DB:
	""" This class holds on direct functionality for maintaining and processing
	the recipe database. It receives requests and interacts with the Mongo database
	client"""

	def __init__(self):
		self.mongo = Mongo("groceries")
		self.username = "" # Note, before any operations can continue, a user must be specified


	### User Operations

	def user_login(self, userData):
		""" Check credentials. If correct, login the user. Otherwise, reject """
		# Check if username in userdata is valid
		uMatch = self.verify_user_credentials(userData)
		if uMatch:
			self.username = userData["username"].lower()
		return uMatch

	def verify_user_credentials(self, userData):
		if not self.user_query(userData):
			return False

		# Check if passwords match
		username = userData["username"].lower()
		userList = self.mongo.find_one("admin", { "_id": "users"})
		userPassTry = userData["password"]
		userPass = userList["u_" + username]["password"]
		passType = userList["u_" + username]["pStorage"] # password storage type

		# Based on password storage type, verify it
		if passType == "plaintext":
			TF = userPassTry == userPass
			# Change the user's password to upgraded hash algorithm

		elif passType == "argon2":
			TF = argon2.verify(userPassTry, userPass)

		return TF


	def user_query(self, userData):
		""" Compare provided userData to database to see if user exists """
		# First check if username is valid
		username = userData["username"].lower()
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
		if self.user_query(userData):
			return False

		# Add username and password
		username = userData["username"].lower()
		userPass = userData["password"]
		method = "argon2"
		if method == "plaintext":
			userDict = {"password" : userPass, "pStorage" : "plaintext"}
		elif method == "argon2":
			userDict = {"password" : argon2.hash(userPass), "pStorage" : "argon2"}

		self.mongo.update("admin", { "_id" : "users"}, {"$set": {"u_" + username: userDict}})

		# Now must also add a new collection to the database for this user
		accountInfo = {}
		accountInfo["_id"] = "u_" + username
		accountInfo["username"] = username
		# Add time account was created
		now = (datetime.datetime.utcnow() - datetime.datetime(1970, 1, 1)).total_seconds() # seconds since epoch
		accountInfo["account-created"] = now
		accountInfo["groups"] = []
		accountInfo["nodes"] = []

		self.mongo.insert_one("users", accountInfo)

		return True

	# Internal helper functions
	def is_valid_username(self, username):
		""" Determine if username string is valid """
		if not type(username) in [str, unicode]:
			return False
		if username == "":
			return False
		# Make sure only letters, underscore, and numbers in username
		if not re.match('\A\w+\Z', username):
			return False
		return True

	def is_user(self, username):
		""" Determine if user name is in database """
		userList = self.mongo.find_one("admin", {"_id": "users"})
		username = "u_" + username
		if username in userList:
			return True
		else:
			return False

	def is_logged_in(self):
		# Simply check to see if the user is logged in
		if self.username:
			return True
		return False

	def logout(self):
		# Logout
		self.username = ""

	# Fully delete a user account
	def delete_user(self, userData):
		# Check credientials. If a match, start deleting
		uMatch = self.verify_user_credentials(userData)
		if uMatch:
			username = userData["username"].lower()
			# Must delete (1) admin entry, (2)user entry, and (3) all user nodes
			# 1) Remove field from users document in admin
			self.mongo.update("admin", { "_id" : "users"},
			{"$unset": {"u_" + username: ""}})

			# 2) Delete the user's document
			self.mongo.delete_many("users", {"_id": "u_" + username})

			#3) Delete all documents from the nodes collection belonging to the user
			self.mongo.delete_many("nodes", {"_id": "id_" + username})

		return uMatch

	###

	def load(self):
		""" read data for user and send back as a dictionary """
		# The returned data will be a dictionary whose keys are the ids of the nodes
		# In each field will be another dictionary with the following keys:
		#	type
		#	shownName
		#	edges
		#	info
		# 	<any additional fields relevant to that node>

		data = {}

		# First, ensure the user has already been set
		if not self.username:
			return data

		nodes = self.mongo.find_one("users", { "_id" : "u_" + self.username})["nodes"]
		for node in nodes:
			nodeDict = self.mongo.find_one("nodes", {"_id": self.getNodeId(node)})
			nodeDict["shownName"] = nodeDict.pop("name") # change key to shownName
			nodeDict.pop("_id") # don't need to include "_id" field
			data[node] = nodeDict

		return data

	def add_node(self, userData):
		""" add a node to the database """
		# userData should be a dictionary with the following fields:
		#	- shownName : shown name for the node
		#	- type 		: what type of node this is
		#	- id   		: unique id for the node (generally <type>_<trimmed name>)

		# First, ensure the user has already been set
		if not self.username:
			return False

		# Add node to user's list
		self.mongo.update("users", { "_id" : "u_" + self.username},
			{"$addToSet": {"nodes": userData["id"]}})

		# To avoid error, ensure this node doesn't exist yet before creating
		# Might want to send an error to the client if this comes up...
		if self.mongo.find("nodes", {"_id": self.getNodeId(userData["id"])}).count() > 0:
			return True

		# Add node
		dictAdd = {
			# what is the usefulness of the "id_" as part of the id string?
			"_id": self.getNodeId(userData["id"]),
			"name": userData["shownName"],
			"type": userData["type"],
			"edges": [],
			"info": [],
		}
		self.mongo.insert_one("nodes", dictAdd)

		return True

	def remove_node(self, userData):
		""" remove the specified node """
		# userData should be a dictionary with the following fields:
		#	- id : id for the node to be deleted

		# First, ensure the user has already been set
		if not self.username:
			return False

		# Remove node
		self.mongo.delete_many("nodes", {"_id": self.getNodeId(userData["id"])})
		# Remove node from user's list
		self.mongo.update("users", { "_id" : "u_" + self.username},
			{"$pull": {"nodes": userData["id"]}})
		return True


	def add_edge(self, userData):
		""" add an edge between two nodes based on their IDs """
		# userData should be a dictionary with the following fields:
		#	- id1 : id for node 1
		#	- id2 : id for node 2

		# First, ensure the user has already been set
		if not self.username:
			return False

		id1 = self.getNodeId(userData["id1"])
		id2 = self.getNodeId(userData["id2"])
		self.mongo.update("nodes", {"_id": id1},
			{ "$addToSet": {"edges": userData["id2"]}})
		self.mongo.update("nodes", {"_id": id2},
			{ "$addToSet": {"edges": userData["id1"]}})

		return True

	def remove_edge(self, userData):
		""" remove an edge between two nodes based on their IDs """
		# userData should be a dictionary with the following fields:
		#	- id1 : id for node 1
		#	- id2 : id for node 2

		# First, ensure the user has already been set
		if not self.username:
			return False

		id1 = self.getNodeId(userData["id1"])
		id2 = self.getNodeId(userData["id2"])
		self.mongo.update("nodes", {"_id": id1},
			{ "$pull": {"edges": userData["id2"]}})
		self.mongo.update("nodes", {"_id": id2},
			{ "$pull": {"edges": userData["id1"]}})

		return True

	def update_node_info(self, userData):
		""" update a node's information (dictionary) """
		# userData should be a dictionary with the following fields:
		#	- id : id for node 1
		#	- info : information dictionary to be saved

		# First, ensure the user has already been set
		if not self.username:
			return False

		nodeid = self.getNodeId(userData["id"])
		info = userData["info"]
		self.mongo.update("nodes", {"_id": nodeid},
			{ "$set": {"info": info}})


		return True

	# Shortcut to generate the "_id" for a node based on its normal id
	def getNodeId(self, id):
		return "id_" + self.username + "_" + id

