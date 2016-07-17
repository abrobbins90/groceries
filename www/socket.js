// Define websocket to be used for server interaction

class Socket { // manually extend WebSocket, because WebSocket didn't want to use "super"
	constructor(receiveData) {
		this.ws = new WebSocket("ws://{{host}}/mySocket")
		this.ws.socket = this
		this.receiveData = receiveData
		this.ws.onmessage = function(event) {
			let inData = JSON.parse(event.data)
			this.socket.receiveData(inData)
		}
		// Once the socket is successfully open, try to login
		this.ws.onopen = function(event) {
			// For now, just try to do a default login
			data = {
				command : "login",
				data : {
					username : "default",
					password : "password"
				};
			};
			this.send(data)
		}
	}
	
	// Send data through websocket
	send(outData) {
		// outData : object to be translated into a string for websocket transfer
		let outDataStr = JSON.stringify(outData)
		this.ws.send(outDataStr)
	}
}

