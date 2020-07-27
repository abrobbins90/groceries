////////////////////////////// Helper Functions

// Given a node name, ensure it follows various rules
function standardizeName(name) {
	// name : a string
	// return the processed name, replacing spaces with '_'. Also make it all lowercase. Remove any special characters as well

	// Ensure name has acceptable characters/format
	name = cleanName(name); // Also, just apply clean name as well

	name = name.toLowerCase(); // make lowercase
	name = name.replace(/\s+/g, '_'); // Replace spaces with underscores

	return name
}

// similar to nameTrim, but primarily avoiding cross site scripting and code injection
function cleanName(name) {
	let illegalChars = /[^0-9A-Za-z _',:]/g;
	name = name.replace(illegalChars, '');
	name = name.trim(); // remove spaces from the ends
	return name
}

// Generatea random string
function getRandomString(N) {
	// Return random string of length N
	let text = "";
	let possible = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	for(let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

// generate an alphanumeric string based on the current time
function getTimeString(short = false) {
	// short: (T/F) if true, shorten string as much as possible while still retaining the time information
	var tStr
	if (short) {
		// Take time given in milliseconds and convert to alphanumeric
		let time = Date.now() // milliseconds since Jan 1, 1970
		let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let N = chars.length;
		// Convert to base 62 (or whatever length of chars)
		let total = time;
		tStr = "";
		while (total > 0) {
			tStr = chars.charAt(total % N) + tStr;
			total = Math.floor(total / N);
		}
	}
	else { // Create long form date string
		let now = new Date();
		tStr = "";
		tStr = tStr + now.getFullYear();
		function get2Str(num) {
			let str = "" + (num>9 ? '' : '0') + num
			return str
		}
		tStr = tStr + get2Str(now.getMonth()+1);
		tStr = tStr + get2Str(now.getDate());
		tStr = tStr + get2Str(now.getHours());
		tStr = tStr + get2Str(now.getMinutes());
		tStr = tStr + get2Str(now.getSeconds());
		let ms = now.getMilliseconds();
		tStr = tStr + (ms>99 ? '' : '0') + (ms>9 ? '' : '0') + ms;
	}
	return tStr
}
