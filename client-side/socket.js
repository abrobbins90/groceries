// Define websocket to be used for server interaction

class Socket { // manually extend WebSocket, because WebSocket didn't want to use "super"
	constructor(serverClass) {
		this.ws = new WebSocket("ws://{{host}}/mySocket")
		this.ws.socket = this
		this.serverClass = serverClass
		this.ws.onmessage = function(event) {
			let inData = JSON.parse(event.data)
			this.socket.serverClass.receiveData(inData)
		}
		// Once the socket is successfully open, try to login
		this.ws.onopen = function(event) {
			this.socket.serverClass.onopen(this.socket)
		}
	}

	// Send data through websocket
	send(outData) {
		// outData : object to be translated into a string for websocket transfer
		let outDataStr = JSON.stringify(outData)
		this.ws.send(outDataStr)
	}
}

