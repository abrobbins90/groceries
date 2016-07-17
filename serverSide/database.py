import mongo
import re
import datetime

class recipe_database:
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
	
	def load():
		""" read the data """
		return ''
		with open("meals.csv", "r") as file:
			data = file.read()
		return data

	def add_recipe(meal):
		""" append a recipe to the data """
		return ''
		meal_csv = convert_to_string(meal)
		with open("meals.csv", "w+") as file:
			file.write(meal_csv)

	def remove_recipe(meal):
		return ''

	def edit_recipe(meal):
		return ''



