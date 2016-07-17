import json

from tornado.web import RequestHandler
from tornado.web import StaticFileHandler
from tornado.websocket import WebSocketHandler
from tornado.web import Application
from tornado.web import url
from tornado.ioloop import IOLoop
from tornado.log import enable_pretty_logging

import sys
sys.path.append('./serverSide')
import database

class SocketHandler (WebSocketHandler):
	""" The WebSocket protocol is still in development. This module currently implements
	the hixie-76 and hybi-10 versions of the protocol. See this browser	compatibility 
	table on Wikipedia: http://en.wikipedia.org/wiki/WebSockets#Browser_support """
		
	def open(self):
		print 'websocket opened!'
		# Create an instance of the recipe database to handle all requests
		self.database = database()

	def on_message(self, message):
		print 'got message: {}'.format(message)
		message = json.loads(message)

		# Check to ensure a command is received
		if "command" not in message:
			raise KeyError("Key 'command' is missing. Way to suck...")
			
		### Check the command received and proceed accordingly
		# user commands
		if message["command"] == "login":
			# Query the database for this user. If successful, assign username and return user info
			success = self.database.user_login(message['data'])
			if success:
				print 'Successful login: ' + self.database.user
				self.send_message('status', 'login:true')
				self.send_message('populate-nodes', self.database.load())
			else:
				print 'Unsuccessful login attempt from: ' + message['data']['username']
				self.send_message('status', 'login:false')

		elif message["command"] == "user-query":
			# Check if username already exists
			exist = self.database.user_query(message['data'])
			if not exist:
				self.send_message('status', 'user-query:true')
			else:
				self.send_message('status', 'user-query:false')
		
		elif message["command"] == "add-user":
			# Add a new user.
			success = self.database.add_user(message['data'])
			if success:
				print 'Added user: ' + self.database.user
				self.send_message('status', 'add-user:true')
			else:
				print 'Failed to add user: ' + message['data']['username']
				self.send_message('status', 'add-user:false')
		
		if message["command"] == "add-node":
			print 'add me'
			self.database.add_recipe(message['data'])
		elif message["command"] == "edit-node":
			print 'edit me'
			self.database.edit_recipe(message['data'])
		elif message["command"] == "remove-node":
			print 'remove me'
			self.database.remove_recipe(message['data'])
			self.write_message({'command': 'ten four'})
		elif message["command"] == "update-data":
			self.send_message('populate-nodes', self.database.load())

	def send_message(self, command, data):
		self.write({
			'command': command,
			'data': data
		})
			
	def on_close(self):
		print 'websocket closed'

class JSSocketHandler (RequestHandler):
	""" This is to render socket.js, passing in the host url """
	def get(self):
		self.render("www-built/socket.js", host=self.request.host)

def make_app():
	return Application(
		[
			url('/mySocket', SocketHandler, {} , name = "a"),
			url('/socket.js', JSSocketHandler, {}, name = "b"),
			url(r'/(.*)', StaticFileHandler, { "path": "www-built/" }) # captures anything at all, and serves it as a static file. simple!
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
