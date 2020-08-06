/*
Contains code for converting quantity-related things, such as converting unit strings between singular and plural, or converting quantities between different units.
*/

function convertUnitToPlural(unit) {
	// Given a unit, convert it to its plural form.  At first, this will be merely adding an "s" if there is none.  In the future, it can be smarter.
	if (_.endsWith(unit, 's')) {
	    return unit
	}
	else {
	    return `{unit}s`
	}
}

function convertUnitToSingular(unit) {
	// Given a unit, convert it to its singular form.  At first, this will be merely removing an "s" if there is one.  In the future, it can be smarter.
	if (_.endsWith(unit, 's')) {
	    return unit.substr(0, unit.length - 1)
	}
	else {
	    return unit
	}
}
