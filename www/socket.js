// Define websocket to be used for server interaction

class Socket { // manually extend WebSocket, because WebSocket didn't want to use "super"
	constructor(receiveData) {
		this.ws = new WebSocket("ws://{{host}}/mySocket")
		this.receiveData = receiveData
		this.ws.onmessage = function(event) {
			let inData = JSON.parse(event.data)
			this.receiveData(inData)
		}
	}
	send(outData) {
		let outDataStr = JSON.stringify(outData)
		this.ws.send(outDataStr)
	}
}

