/*
The unit-test file for quantity.js
*/
const q = require('./quantity')



test('getUserInputtedAmountString', () => {
	// no amount given (implicit amount)
	expect(	q.getUserInputtedAmountString('stick of butter') ).toBe('')
	// basic numbers
	expect(	q.getUserInputtedAmountString('1 carrot') ).toBe('1 ')
	expect(	q.getUserInputtedAmountString('1 bag of corn') ).toBe('1 ')
	expect(	q.getUserInputtedAmountString('2 bags of corn') ).toBe('2 ')
	// whitespace
	expect(	q.getUserInputtedAmountString('  1 carrot') ).toBe('  1 ')
	// fractions
	expect(	q.getUserInputtedAmountString('1/2 ounce carrots') ).toBe('1/2 ')
	// mixed numbers
	expect(	q.getUserInputtedAmountString('2 3/4 cup cake mix') ).toBe('2 3/4 ')
	// decimals
	expect(	q.getUserInputtedAmountString('1.5 crackers') ).toBe('1.5 ')
});

test('getAmount', () => {
	// implicit amount
	expect(q.	getAmount('stick of butter') ).toBe(1)
	// basic numbers
	expect(q.	getAmount('1 bag of corn') ).toBe(1)
	expect(q.	getAmount('2 bags of corn') ).toBe(2)
	// // fractions
	// expect(q.	getAmount('1/2 ounce carrots') ).toBe(0.5)
	// // what should we do for stuff like 1/3?
	// // mixed numbers
	// expect(q.	getAmount('2 3/4 cup cake mix') ).toBe(2.75)
	// decimals
	expect(q.	getAmount('1.5 crackers') ).toBe(1.5)
})

test('getUserInputtedUnit', () => {
	// no amount given
	expect(q.	getUserInputtedUnit('stick of butter') ).toBe('stick')
	// amount given
	expect(q.	getUserInputtedUnit('1 stick of butter') ).toBe('stick')
	// no unit given
	expect(q.	getUserInputtedUnit('2 oranges') ).toBe('')
	// unit given with 1-word ingredient
	expect(q.	getUserInputtedUnit('2 lbs oranges') ).toBe('lbs')
	// unit given with 2-word ingredient
	expect(q.	getUserInputtedUnit('2 lbs salted peanuts') ).toBe('lbs')
	// unit given in the singular form
	expect(q.	getUserInputtedUnit('2 lb oranges') ).toBe('lb')
	// unit given in the plural form
	expect(q.	getUserInputtedUnit('5 tsps vanilla') ).toBe('tsps')
})

test('getUnit', () => {
	// no amount given
	expect(q.	getUnit('stick of butter') ).toBe('stick')
	// amount given
	expect(q.	getUnit('1 stick of butter') ).toBe('stick')
	// no unit given
	expect(q.	getUnit('2 oranges') ).toBe('')
	// unit given with 1-word ingredient
	expect(q.	getUnit('2 lbs oranges') ).toBe('lbs')
	// unit given with 2-word ingredient
	expect(q.	getUnit('2 lbs salted peanuts') ).toBe('lbs')
	// unit given in the singular form
	expect(q.	getUnit('2 lb oranges') ).toBe('lbs')
	// unit given in the plural form
	expect(q.	getUserInputtedUnit('5 tsps vanilla') ).toBe('tsps')
})

test('getAmountString', () => {
	// natural number
	expect(q.	getAmountString(5, 'lbs') ).toBe('5')
	// // fraction
	// expect(q.	getAmountString(0.3333, 'lbs') ).toBe('1/3')
	// decimal, 1 decimal place
	expect(q.	getAmountString(0.5, 'lbs') ).toBe('0.5')
	// decimal, 2 decimal places
	expect(q.	getAmountString(0.51, 'lbs') ).toBe('0.51')
	// decimal, 3 decimal places
	expect(q.	getAmountString(0.512, 'lbs') ).toBe('0.51')
})

test('getUnitString', () => {
	// blank
	expect(q.	getUnitString(1, '') ).toBe('')
	// whole
	expect(q.	getUnitString(1, 'whole') ).toBe('')
	// small, large, etc
	expect(q.	getUnitString(1, 'small') ).toBe('small')
	// singular
	expect(q.	getUnitString(1, 'cups') ).toBe('cup')
	// plural
	expect(q.	getUnitString(2, 'cups') ).toBe('cups')
})

test('getAmountUnitString', () => {
	// basic usage
	expect(q.	getAmountUnitString(0.5, 'cups') ).toBe('0.5 cups')
})





// Quantity Class

test('getUnits', () => {
	// 1 unit
	expect(new q.Quantity({unitToAmount: {'cups': 0.5}}).getUnits() ).toBe(['cups'])
})

test('getCombinedAmountUnitString', () => {
	// // 1 unit
	// expect(q.	new Quantity({unitToAmount: {'cups': 0.5}}).getCombinedAmountUnitString() ).toBe('0.5 cups')
	// // 2 units
	// expect(q.	new Quantity({unitToAmount: {'cups': 0.5, 'tsps': 1}}).getCombinedAmountUnitString() ).toBe('0.5 cups, 1 tsp')
})




// constructor functions

test('constructQuantityFromUserInputtedString', () => {
	// basic usage
	const quantity = q.constructQuantityFromUserInputtedString('0.5 cups malted barley')
	const units = quantity.getUnits()
	expect(q.	units.length ).toBe(1)
	expect(q.	units[0] ).toBe('cups')
	const amount = quantity.unitToAmount['cups']
	expect(q.	amount ).toBe(0.5)
})

test('constructQuantityFromObjects', () => {
	// basic usage
	const objects = [{unitToAmount: {'cups': 0.5}}, {unitToAmount: {'cups': 0.5, 'liters': 3}}]
	const quantity = q.constructQuantityFromObjects(objects)
	const units = quantity.getUnits()
	expect(q.	units.length ).toBe(2)
	expect(q.	quantity.unitToAmount['cups'] ).toBe(1)
	expect(q.	quantity.unitToAmount['liters'] ).toBe(3)
})


