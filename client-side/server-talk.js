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
		this.username = ""
		this.queries = {} // list of open queries
		this.mute = false
	}

	// assign socket and try to log in once socket opens
	onopen(socket) {
		this.socket = socket;
		// Try to login if there is enough information

		// For now, just try to do a default login
		let data = {
			username : "default",
			password : "password"
		};
		this.send("login", data, "login")
	}
	// Handle login information from the server
	login(data) {
		let success = data.status;
		if (success) { // Successfully logged in
			let username = data.username;
			this.username = username;

			// Import all of the users data from the server
			this.importData(data.data);

		}
		else { // unsuccessfull login attempt

		}

	}
	// Import ALL of the server's data for this user
	importData(data) {
		// While importing is happening, as nodes, etc. are created
		// mute all outgoing messages
		this.mute = true;

		// data should be an object whose keys are node IDs
		// the contents of each should contain all required node information
		for (let id in data) {
			// Make it easier to access node for edges
			data[id].node = graph.addNode(data[id].type, data[id].shownName)
			// Any additional relevant fields...
		}
		// Repeat loop but for edges
		for (let id1 in data) {
			let edges = data[id1].edges;
			for (let id2 of edges) {
				graph.addEdge(data[id1].node, data[id2].node)
			}
		}

		this.mute = false;
		
		searchArea.launchSearch();
		
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
			this.queries[token] = responseFunction;
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
				this[this.queries[token]](data)
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
