////////////////////////////// Helper Functions

// Given a node name, ensure it follows various rules
function nameTrim(name) {
	// name : a string
	// return the processed name, replacing spaces with '_'. Also make it all lowercase. Remove any special characters as well

	name = name.toLowerCase(); // make lowercase
	name = name.trim(); // remove spaces from the ends
	name = name.replace(/\s+/g, '_'); // Replace spaces with underscores
	name = name.replace(/\W/g, ''); // remove anything but letters, numbers, and _

	return name
}

// similar to nameTrim, but primarily avoiding cross site scripting and code injection
function cleanName(name) {
	let allowedChars = /[^0-9A-Za-z _',:]/g;
	name = name.replace(allowedChars, '');
	return name
}