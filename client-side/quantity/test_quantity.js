/*
The unit-test file for quantity.js
*/

function test_getUserInputtedAmountString() {
	// no amount given (implicit amount)
	getUserInputtedAmountString('stick of butter') === ''
	// basic numbers
	getUserInputtedAmountString('1 carrot') === '1 '
	getUserInputtedAmountString('1 bag of corn') === '1 '
	getUserInputtedAmountString('2 bags of corn') === '2 '
	// whitespace
	getUserInputtedAmountString('  1 carrot') === '  1 '
	// fractions
	getUserInputtedAmountString('1/2 ounce carrots') === '1/2 '
	// mixed numbers
	getUserInputtedAmountString('2 3/4 cup cake mix') === '2 3/4 '
	// decimals
	getUserInputtedAmountString('1.5 crackers') === '1.5 '
}

function test_getAmount() {
	// implicit amount
	getAmount('stick of butter') === 1
	// basic numbers
	getAmount('1 bag of corn') === 1
	getAmount('2 bags of corn') === 2
	// fractions
	getAmount('1/2 ounce carrots') === 0.5
	// what should we do for stuff like 1/3?
	// mixed numbers
	getAmount('2 3/4 cup cake mix') === 2.75
	// decimals
	getAmount('1.5 crackers') === 1.5
}

function test_getUserInputtedUnit() {
	// no amount given
	getUserInputtedUnit('stick of butter') === 'stick'
	// amount given
	getUserInputtedUnit('1 stick of butter') === 'stick'
	// no unit given
	getUserInputtedUnit('2 oranges') === ''
	// unit given with 1-word ingredient
	getUserInputtedUnit('2 lbs oranges') === 'lbs'
	// unit given with 2-word ingredient
	getUserInputtedUnit('2 lbs salted peanuts') === 'lbs'
	// unit given in the singular form
	getUserInputtedUnit('2 lb oranges') === 'lb'
	// unit given in the plural form
	getUserInputtedUnit('5 tsps vanilla') === 'tsps'
}

function test_getUnit() {
	// no amount given
	getUnit('stick of butter') === 'stick'
	// amount given
	getUnit('1 stick of butter') === 'stick'
	// no unit given
	getUnit('2 oranges') === ''
	// unit given with 1-word ingredient
	getUnit('2 lbs oranges') === 'lbs'
	// unit given with 2-word ingredient
	getUnit('2 lbs salted peanuts') === 'lbs'
	// unit given in the singular form
	getUnit('2 lb oranges') === 'lbs'
	// unit given in the plural form
	getUserInputtedUnit('5 tsps vanilla') === 'tsps'
}

function test_getAmountString() {
	// natural number
	getAmountString(5, 'lbs') === '5'
	// fraction
	getAmountString(0.3333, 'lbs') === '1/3'
	// decimal, 1 decimal place
	getAmountString(0.5, 'lbs') === '0.5'
	// decimal, 2 decimal places
	getAmountString(0.51, 'lbs') === '0.51'
	// decimal, 3 decimal places
	getAmountString(0.512, 'lbs') === '0.51'
}

function test_getUnitString() {
	// blank
	getUnitString(1, '') === ''
	// whole
	getUnitString(1, 'whole') === ''
	// small, large, etc
	getUnitString(1, 'small') === 'small'
	// singular
	getUnitString(1, 'cups') === 'cup'
	// plural
	getUnitString(2, 'cups') === 'cups'
}

function test_getAmountUnitString() {
	// basic usage
	getAmountUnitString(0.5, 'cups') === '0.5 cups'
}





// Quantity Class

function test_getUnits() {
	// 1 unit
	new Quantity({unitToAmount: {'cups': 0.5}}).getUnits() === ['cups']
}

function test_getCombinedAmountUnitString() {
	// 1 unit
	new Quantity({unitToAmount: {'cups': 0.5}}).getCombinedAmountUnitString() === '0.5 cups'
	// 2 units
	new Quantity({unitToAmount: {'cups': 0.5, 'tsps': 1}}).getCombinedAmountUnitString() === '0.5 cups, 1 tsp'
}




// constructor functions

function test_constructQuantityFromUserInputtedString(user_inputted_string) {
	// basic usage
	const quantity = constructQuantityFromUserInputtedString('0.5 cups malted barley')
	const units = quantity.getUnits()
	units.length === 1
	units[0] === 'cups'
	const amount = quantity.unitToAmount['cups']
	amount === 0.5
}

function test_constructQuantityFromObjects() {
	// basic usage
	const objects = [{unitToAmount: {'cups': 0.5}}, {unitToAmount: {'cups': 0.5, 'liters': 3}}]
	const quantity = constructQuantityFromObjects(objects)
	const units = quantity.getUnits()
	units.length === 2
	quantity.unitToAmount['cups'] === 1
	quantity.unitToAmount['liters'] === 3
}








