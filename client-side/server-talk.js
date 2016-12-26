// class to manage client-side interaction with the server

// Notes on operation:
//	-several times, a command or query request will be sent
//	 to the server, and we'll need to get a response. To
//	 manage this, all queries will be given a token so that
//	 returned responses can be properly picked up where they
//	 left off
//	 A list of open queries, their tokens, and the function
//	 to be called on response will be kept as a dictionary

class ServerTalk {
	constructor() {
		this.socket = undefined // will add this when socket is opened
		this.queries = {} // list of open queries
		this.mute = true
	}

	// assign socket and try to log in once socket opens
	onopen(socket) {
		this.socket = socket;
		// Try to login if there is enough information

		// program to check cookies for old login information
	}


	// Send a request to the server
	send(command, data, responseFunction = false) {
		// If response function is not false, create a token and assign it
		// to the response function so a response can be correctly re-routed
		if (this.mute) {return}

		let outData = {
			command : command,
			data : data
		};
		if (responseFunction !== false) {
			let token = this.makeToken();
			outData.token = token;
			this.queries[token] = {}
			this.queries[token].func = responseFunction
			this.queries[token].outData = data // store outgoing data
		}
		// send request onto the server through the socket
		this.socket.send(outData)
	}

	// function receive messages from the server
	receiveData(inData) {
		// inData : object with fields:
		//		command : states purpose of messages
		//		data : content of message

		let command = inData.command;
		let data = inData.data;

		if (command === "response") {
			// Receive a response message to a request of some sort
			let token = data.token;
			// Ensure this is an open query
			if (this.queries.hasOwnProperty(token)) {
				// Call response function and pass data
				this.queries[token].func(data, this.queries[token].outData)
				// Clear query
				delete this.queries[token]
			}
		}

	}

	// Generate a random token to identify query requests/responses
	makeToken() {
		// token will be 16 characters long
		let length = 16;
		let text = "";
		let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for(let i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}
}
