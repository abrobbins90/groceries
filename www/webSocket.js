

function WSsend(outData) {
	outDataStr = JSON.stringify(outData);
	myWS.send(outDataStr);
}

