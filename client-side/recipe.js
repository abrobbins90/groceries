//Class for all recipe handling in groceries

class Input {
	get meal() {
		return $("#meal_input")
	}
	get ingr() {
		return $("#ingr_input")
	}
	get tag() {
		return $("#tag_input")
	}
	get mealButton() {
		return $("#meal_button")
	}
}

class RecipeArea {
	constructor(graph) {
		this.name = "recipe"
		this.graph = graph

		function appendLocation(box){
			return "#" + box.node.type + "_entry"
		}
		this.closet = new Closet(this, {
			"appendLocation": appendLocation,
			"className": "recipe_box",
			"isDraggable": false,
			"isBoxXable": true,
			"XAction": function(){
				recipe.removeEdge(this.node.type, this.node.name)
				this.destruct()
			},
			"singleClick": function(event) {}, 
		})

		this.input = new Input()

		this.mode = "closed"
	}

	keyPress(key, type, shownName) {
		if (key === 13) { // Enter Button
			return this.createNode(type, shownName)
		}
		else {
			this.search(type, shownName)
		}
		return false
	}

	////////////////////////////// Node/Edge Creation/Deletion Functions

	// search for existing nodes connected to this.selectedMeal
	search(type, shownName) {
		if (type === "meal") {
			if( this.selectedMeal ) this.writeDisplay()
			else this.clearDisplay()
		}
		else {
			// Otherwise, check to see if the node exists. If so, mark as selected
			let name = nameTrim(shownName)
			let node = this.graph.getNodeById(type + "_" + name)
			if( node ) this.input[type].addClass("input_selected")
			else this.input[type].removeClass("input_selected")
		}
	}

	// [ACTION] Add a new node
	createNode(type, shownName) {
		if( !nameTrim(shownName) ) return false

		let node = this.graph.addNode(type, shownName)

		if( type !== 'meal' ){
			// Check to see if this node is already an edge
			if (this.selectedMeal.edges.has(node)) return node // do nothing

			this.graph.addEdge(this.selectedMeal, node)
			// if the selected meal is on the menu, and it's being added to right now,
			// update the grocery list
			if (this.selectedMeal.inMenu) {
				groceryArea.updateGroceryList()
			}
			
			this.input[type].val("") // clear entry area
			this.input[type].removeClass("input_selected")
		}

		this.writeDisplay()

		if( type === 'meal' ){
			// Put focus on new ingredient field, assuming that's next!
			this.input.ingr.focus()
		}

		return node
	}

	// [ACTION: Remove Meal Button] Remove a recipe
	removeMeal(mealNode = this.selectedMeal) {
		// mealNode : node object of meal to be deleted (default meal to delete is current selection)
		this.graph.removeNode(mealNode) // Delete meal
		this.clearDisplay()
		this.input.meal.focus()
	}

	// [ACTION: Remove node edge] Remove an ingr or tag from a menu
	removeEdge(type, name) {
		let node = this.graph.getNodeById(type + "_" + name)
		if( !node || !this.selectedMeal ){
			throw 'No such node.'
			return false
		}
		this.graph.removeEdge(this.selectedMeal, node)
		if (node.edges.size === 0) {
			this.graph.removeNode(node)
		}
		this.input[type].focus()
	}

	/////////////////////////

	// Figure out what meal is selected, or if there is none
	get selectedMeal() {
		let shownName = $('#meal_input').val() // we want something static (for robustness) we can have the event update the jquery el (static jquery el)
		let name = nameTrim(shownName)
		if( !name ) return false

		// Check what meal node is referenced in the meal input box
		return this.graph.getNodeById("meal_" + name)
	}

	// Manually choose a meal to be selected
	selectMeal(node) {
		$('#meal_input').val(node.shownName)
		this.search("meal", node.shownName)
	}

	////////// Recipe Display Functions

	clearDisplay() {
		if( this.mode === "open" ) {
			this._clearCloset()
			this._toggleDisplay()
		}
		this.mode = "closed"
	}

	writeDisplay() {
		if( this.mode === "closed" ) this._toggleDisplay()
		this.mode = "open"

		this._fillCloset()
	}

	_toggleDisplay() {
		$('#meal_input').toggleClass("input_selected")
		$('#create_meal_button').toggle()
		$('#remove_meal_button').toggle()
		this.input.ingr.toggle()
		this.input.tag.toggle()
	}

	_clearCloset() {
		this.closet.destructBoxes()
		this.input.ingr.removeClass("input_selected").val("")
		this.input.tag.removeClass("input_selected").val("")
	}

	_fillCloset() {
		this.closet.addNodes(Array.from(this.selectedMeal.edges), true)
	}
}
