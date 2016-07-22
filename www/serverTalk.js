// class to manage client-side interaction with the server

class serverTalk {
	constructor() {
		
	}
	
	// function receive messages from the server
	receiveData(inData) {
		// inData : object with fields:
		//		command : states purpose of messages
		//		data : content of message
		
		let command = inData.command;
		let data = inData.data;
		
		if (command == "status") {
			// Receive a status message
			// status messages are typically a response to a command
			
		}
		else if(/^download:/.test(command)) {
			
		}
	}
	
}