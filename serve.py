from tornado.web import RequestHandler
from tornado.web import StaticFileHandler
from tornado.websocket import WebSocketHandler
from tornado.web import Application
from tornado.web import url
from tornado.ioloop import IOLoop
from tornado.log import enable_pretty_logging

import data

class SocketHandler (WebSocketHandler):
	""" The WebSocket protocol is still in development. This module currently implements the hixie-76 and hybi-10 versions of the protocol. See this browser compatibility table on Wikipedia: http://en.wikipedia.org/wiki/WebSockets#Browser_support """
	def open(self):
		print 'websocket opened!'
		self.write({
			'command': 'populate-nodes',
			'data': data.load()
		})

	def on_message(self, message):
		print 'got message: ' + message

		# Check to ensure a command is received
		if "command" not in message:
			raise KeyError("Key 'command' is missing. Way to suck...")
		# Check the command received and proceed accordingly
		if message["command"] == "add meal":
			print 'add me'
		elif message["command"] == "edit meal":
			print 'edit me'
		elif message["command"] == "remove meal":
			print 'remove me'
			self.write_message({'command': 'ten four'})
		elif message["command"] == "update-data":
			self.write({
				'command': 'populate-nodes',
				'data': data.load()
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
