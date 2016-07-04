
// Define websocket to be used for server interaction
function initWS() {
	var newWS = new WebSocket("ws://learnnation.org:8243/mySocket");
	newWS.onmessage = function(event){
		inData = JSON.parse(event.data);
		receiveData(inData);
	}
	return newWS
}
	
function WSsend(outData) {
	outDataStr = JSON.stringify(outData);
	ws.send(outDataStr);
}

