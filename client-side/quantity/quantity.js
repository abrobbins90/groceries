/*
The 'quantity' data model and class are stored here.
*/
console.log('quantity.js')

/*
## Quantity Data Model:

    {
        unitToAmount: {
            "head": 2,
        },
    }

For example, the user may have typed "2 heads of broccoli".  For example, "1/3 cup sugar".

For a single thing that a user has typed, the dictionary will be a singleton.  But when we combine together ingredients, the dictionary may have more keys.
*/
const _ = require('lodash')

const convert = require('./convert')


// Atomic Quantity Helper Functions:
// These functions take in a single user-inputted string, and are used by the Quantity class.

function getUserInputtedAmountString(user_inputted_string) {
    // Returns the RAW user-inputted amount string with NO modifications.
    // Uses a regex to find and return the amount that the user typed.  For example, `"2"` or even `"1 /3"` (note the space).
    const found = user_inputted_string.match(/^[\s-\d./]*/)
    if (found === null) {
        // if there is no match, something has gone terribly wrong.  Our regex by design should always match, even if the match is just an empty string
        throw 'User inputted amount string regex find is null.'
    }
    else {
        // found[0] is the entire match while found[1] is the contents of the first capture group.
        const user_inputted_amount = found[0]
        return user_inputted_amount
    }
}

function getAmount(user_inputted_string) {
    // Uses getUserInputtedAmountString and then processes it into a JavaScript decimal.  For example, function 2` or function 0.33`.
    const user_inputted_amount = getUserInputtedAmountString(user_inputted_string)
    const trimmed_amount = user_inputted_amount.trim()
    if (trimmed_amount === '') {
        // If no amount is found, we default to 1.  This makes sense for inputs like "apple" or "stick of butter".
        return 1
    }
    else {
        return parseFloat(trimmed_amount)
    }
}

function getUserInputtedUnit(user_inputted_string) {
    // Uses a regex to find and return the unit that the user typed.  For example, `"heads"`.  For example, `"head"`.  For example, `"cup"`.
    const user_inputted_amount = getUserInputtedAmountString(user_inputted_string)
    const user_inputted_unit_and_more = user_inputted_string.substr(user_inputted_amount.length)
    // The \w+ on the right guarantees that something will be interpreted as an ingredient name.  If the person types a single ingredient name and no unit, then we want the unit to be '', not 'ingredientname'
    const found = user_inputted_unit_and_more.match(/^(\w*)\b\s*\b\w+/)
    if (found === null) {
        // If no unit is found, something has gone terribly wrong.
        return 'User inputted unit string regex find is null'
    }
    else {
        // found[0] is the entire match while found[1] is the contents of the first capture group.
        const user_inputted_unit = found[1]
        return user_inputted_unit
    }
}

function getUnit(user_inputted_string) {
    // Uses getUserInputtedUnit and then converts it to a "standard" plural form using convertUnitToPlural.
    const user_inputted_unit = getUserInputtedUnit(user_inputted_string)
    const trimmed_unit = user_inputted_unit.trim()
    if (trimmed_unit === '') {
        // if no unit is found, we default to the empty string ''.  We could alternatively default to 'whole'.
        return ''
    }
    else {
        const standardized_unit = convert.unitToPluralUnit(trimmed_unit)
        return standardized_unit
    }
}



// stringification helper functions

function getAmountString(amount, unit) {
    // Given a unit and an amount, outputs a stringified amount.
    const amount_string = `${amount}`
    // The displayed about will show AT MOST 2 decimal places, but not unecessarily.
    const found = amount_string.match(/\./)
    if (found === null) {
        return amount_string
    }
    else {
        const two_places_amount = amount.toFixed(2)
        let string = `${two_places_amount}`
        // trim any trailing zeros (or the decimal place), since we don't want them unecessarily
        while (_.endsWith(string, '0') || _.endsWith(string, '.')) {
            string = string.substr(0, string.length - 1)
        }
        return string
    }
}

function getUnitString(amount, unit) {
    // Correctly formats the **unit** (including pluralization).
    if (unit === '' || unit === 'whole') {
        return ''
    }
    else if (unit === 'small' || unit === 'large') {
        return unit
    }
    else if (amount === 1) {
        return convert.unitToSingularUnit(unit)
    }
    else {
        return convert.unitToPluralUnit(unit)
    }
}

function getAmountUnitString(amount, unit) {
    // Helper function.  Given a unit and an amount, output the correct pluralized formatted string.
    // For example, `"2 heads"`.  For example, `"1/3 cups"`.
    return `${getAmountString(amount, unit)} ${getUnitString(amount, unit)}`
}




// Quantity Class:
// Contains the data model dictionary and also the following methods.  Note that these methods must deal with COMBINING data from multiple quantities.

class Quantity {
    constructor(dict) {
        // Instantiates a Quantity object.
        // Given an already-good {unitToAmount:{}} dictionary (from the DB), populate the object.
        this.unitToAmount = dict.unitToAmount
    }
    getUnits() {
        // Return an array of the units, in a stable order
        const ordered_units = _.sortBy(_.keys(this.unitToAmount))
        return ordered_units
    }
    getCombinedAmountUnitString() {
        // Takes the this.getUnitToAmountDict() dictionary and then outputs the concatenation of function getAmountUnitString(amount, unit) for each key-value pair.
        const ordered_units = this.getUnits()
        const amount_unit_strings = _.map(ordered_units, (unit) => {
            const amount = this.unitToAmount[unit]
            return getAmountUnitString(amount, unit)
        })
        const combined_amount_unit_string = _.join(amount_unit_strings, ', ')
        return combined_amount_unit_string
    }
}



// Quantity constructor convenience functions (Quantity factory)

function constructQuantityFromUserInputtedString(user_inputted_string) {
    // Instantiates a Quantity object.
    // Calls the "userInputted" functions above in order to get the unit and amount.  Then constructs the {unitToAmount:{}} thingy.
    const unit = getUnit(user_inputted_string)
    const amount = getAmount(user_inputted_string)
    const dict = {
        unitToAmount: {[unit]: amount}
    }
    const quantity = new Quantity(dict)
    return quantity
}

function constructQuantityFromObjects(quantity_objects) {
    // Instantiates a Quantity object.
    // Given an iterable of Quantity objects, create a new Quantity object which combines them.
    const unit_to_amount_dicts = _.map(quantity_objects, 'unitToAmount')
    // merge the dictionaries, adding the values together when the keys match
    const combiner = (amountA, amountB) => {
        // undefined amounts are the same as 0
        return (amountA || 0) + (amountB || 0)
    }
    const merged_dict = _.mergeWith({}, ...unit_to_amount_dicts, combiner)
    const quantity = new Quantity({unitToAmount: merged_dict})
    return quantity
}


// exports for jest
module.exports = {
    getUserInputtedAmountString,
    getAmount,
    getUserInputtedUnit,
    getUnit,
    getAmountString,
    getUnitString,
    getAmountUnitString,
    Quantity,
    constructQuantityFromUserInputtedString,
    constructQuantityFromObjects,
}


