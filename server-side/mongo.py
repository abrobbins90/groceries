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

    def insert_one(self, collection, dic):
        self.client[self.database][collection].insert_one(dic)

    def insert_many(self, collection, list_of_dicts):
        # Will complain if you attempt to insert duplicates
        self.client[self.database][collection].insert_many(list_of_dicts)

    def update(self, collection, query, update):
        self.client[self.database][collection].update_one(query, update, upsert=False)

    def upsert(self, collection, query, update):
        self.client[self.database][collection].update_one(query, update, upsert=True)

    def find(self, collection, dict_fields=None, projection=None):
        return self.client[self.database][collection].find(dict_fields, projection)
		
    def find_one(self, collection, dict_fields=None, projection=None):
        return self.client[self.database][collection].find_one(dict_fields, projection)

    def delete_many(self, collection, dict_fields):
        # This will delete from all fields which match the parameter!!
        results = self.client[self.database][collection].delete_many(dict_fields)
