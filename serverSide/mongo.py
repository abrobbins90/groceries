from pymongo import MongoClient

# As implemented for groceries, the database will be called groceries
# Individual collections will exist for each user and each group
# One collection will be dedicated for internal use only with database
# information

class Mongo:

    def __init__(self, database):
        self.client = MongoClient("mongodb://localhost")
        self.database = database

    def __str__(self):
        msg = "(client: {}, db: {})".format(self.client, self.database)
        return msg

    def insertOne(self, collection, dic):
        self.client[self.database][collection].insertOne(dic)

    def insertMany(self, collection, list_of_dicts):
        # Will complain if you attempt to insert duplicates
        self.client[self.database][collection].insertMany(list_of_dicts)

    def update(self, collection, query, update, options):
        self.client[self.database][collection].update(query, update, options)

    def upsert(self, collection, query, update):
        self.client[self.database][collection].update(query, update, upsert=True)

    def find(self, collection, dict_fields=None, projection=None):
        return self.client[self.database][collection].find(dict_fields, projection)
		
	def findOne(self, collection, dict_fields=None, projection=None):
        return self.client[self.database][collection].findOne(dict_fields, projection)

    def deleteMany(self, collection, dict_fields):
        # This will delete from all fields which match the parameter!!
        results = self.client[self.database][collection].deleteMany(dict_fields)
