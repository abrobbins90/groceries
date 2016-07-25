import json
from os import path

from tornado.web import RequestHandler
from tornado.web import StaticFileHandler
from tornado.websocket import WebSocketHandler
from tornado.web import Application
from tornado.web import url
from tornado.ioloop import IOLoop
from tornado.log import enable_pretty_logging

import sys
sys.path.append('./serverSide')
from database import DB

CLIENT_SIDE_DIRECTORY_PATH = "../client-side-built/"


class SocketHandler (WebSocketHandler):
	""" The WebSocket protocol is still in development. This module currently implements
	the hixie-76 and hybi-10 versions of the protocol. See this browser	compatibility
	table on Wikipedia: http://en.wikipedia.org/wiki/WebSockets#Browser_support """


	def open(self):
		print 'websocket opened!'
		# Create an instance of the recipe database to handle all requests
		self.db = DB()

	def on_message(self, message):
		# Convert things to be more friendly.  Check for good input.
		assert type(message) in [str, unicode]
		print 'got message: {0}'.format(message)
		message_dict = json.loads(message)
		assert type(message_dict) == dict
		# Check to ensure a command is received
		if "command" not in message_dict:
			raise KeyError("Key 'command' is missing. Way to suck...")
		command, data, token = message_dict["command"], message_dict["data"], message_dict["token"]

		### Check the command received and proceed accordingly
		# user commands
		if command == "login":
			# Query the database for this user. If successful, assign username and return user info
			success = self.db.user_login(data)
			response = {};
			if success:
				print 'Successful login: ' + self.db.username
				response["status"] = True
				response["username"] = self.db.username
				response["data"] = self.db.load()
			else:
				print 'Unsuccessful login attempt from: ' + data['username']
				response["status"] = False
			# Send response to login request
			response["token"] = token
			self.send_message('response', response)

		elif command == "user-query":
			# Check if username already exists
			exist = self.db.user_query(data)
			response = {};
			# Send response to user query
			response["token"] = token
			response["status"] = exist
			self.send_message('response', response)

		elif command == "add-user":
			# Add a new user.
			success = self.db.add_user(data)
			response = {};
			if success:
				print 'Added user: ' + data['username']
			else:
				print 'Failed to add user: ' + data['username']
			# Send response to user query
			response["token"] = token
			response["status"] = success
			self.send_message('response', response)

		if command == "add-node":
			success = self.db.add_node(data)
			if success:
				print 'added node'
			else:
				print 'failed to add node'

		elif command == "remove-node":
			success = self.db.remove_node(data)
			if success:
				print 'removed node'
			else:
				print 'failed to remove node'

		elif command == "add-edge":
			success = self.db.add_edge(data)
			if success:
				print 'added edge'
			else:
				print 'failed to add edge'

		elif command == "remove-edge":
			success = self.db.remove_edge(data)
			if success:
				print 'removed edge'
			else:
				print 'failed to remove edge'


		elif command == "update-data":
			# Request data is updated
			self.send_message('download:full', self.db.load())

	def send_message(self, command, data):
		self.write_message({
			'command': command,
			'data': data,
		})

	def on_close(self):
		print 'websocket closed'


class JSSocketHandler (RequestHandler):
	""" This is to render socket.js, passing in the host url """


	def get(self):
		self.render(path.join(CLIENT_SIDE_DIRECTORY_PATH, "socket.js"), host=self.request.host)


def make_app():
	return Application(
		[
			url('/mySocket', SocketHandler, {} , name = "a"),
			url('/socket.js', JSSocketHandler, {}, name = "b"),
			url(r'/(.*)', StaticFileHandler, { "path": CLIENT_SIDE_DIRECTORY_PATH }) # captures anything at all, and serves it as a static file. simple!
		],
		#settings
		debug = True,
	)

def main():
	enable_pretty_logging()
	application = make_app()
	application.listen(8243) # groceries port number
	IOLoop.current().start()

if __name__ == "__main__":
	main()
