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
		this.graph = graph
		this.boxes = new Boxes(this.removeEdge.bind(this))
		this.input = new Input()
	}

	keyPress(key, type, shownName) {
		if (key === 13) { // Enter Button
			this.createNode(type, shownName)
		}
		else {
			this.search(type, shownName)
		}
	}

	////////////////////////////// Node/Edge Creation/Deletion Functions
	// [ACTION] Add a new node
	createNode(type, shownName) {
		if( !nameTrim(shownName) ) return false

		let node = this.graph.addNode(type, shownName)

		if( type !== 'meal' ){
			// Add edge
			this.graph.addEdge(this.selectedMeal, node)
			this.input[type].val("") // clear entry box
			this.input[type].addClass("node_input " + type + "_box")
		}
		if( type === 'meal' ){
			// Put focus on new ingredient field, assuming that's next!
			this.writeDisplay(shownName)
			this.input.ingr.focus()
		}

		ws.send({command: 'add-node', node: node.asDict()})
		return node
	}
	createMeal() {
		return this.createNode('meal')
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
		let node = this.graph.getNodeByID(type, name)
		if( node === -1 || this.selectedMeal === -1 ){
			throw 'No such node.'
			return false
		}
		this.graph.removeEdge(this.selectedMeal, node)
		if (node.edges.size === 0) {
			this.graph.removeNode(node)
		}
		this.writeDisplay(this.selectedMeal)
		this.input[type].focus()
	}

	/////////////////////////

	// search for existing nodes to match shownName
	search(type, shownName) {
		let name = nameTrim(shownName)
		if( !name ) return false

		if (type === "meal") {
			// If it's a meal search, update display
			// this.updateDisplay(shownName)
		}
		else {
			// Otherwise, check to see if the node exists. If so, mark as selected
			let node = this.graph.getNodeByID(type, name)
			if( node === -1 ) this.input[type].removeClass("node_selected")
			else this.input[type].addClass("node_selected")
		}
	}

	// Figure out what meal is selected, or if there is none
	get selectedMeal() {
		let shownName = $('#meal_input').val()
		let name = nameTrim(shownName)
		if( !name ) return -1

		// Check what meal node is referenced in the meal input box
		return this.graph.getNodeByID("meal", name)
	}

	////////// Recipe Display Functions

	get open() {
		return this.selectedMeal !== -1
	}


	writeDisplay(shownName) {
		this.boxes.destroy()
		// show neighbors
		for (let node of this.selectedMeal.edges) {
			this.boxes.add(node)
		}
		this.search("ingr", shownName)
		this.search("tag", shownName)
	}

	clearDisplay() {
		this.boxes.destroy()
	}


	// updateDisplay(mode) {
	// 	this.repopulateDisplay()
	// 	if( this.modeChange ) this.toggleDisplay()
	// }

	toggleDisplay() {
		$('#meal_input').toggleClass("node_selected")
		$('#create_meal_button').toggle()
		$('#remove_meal_button').toggle()
		this.input.ingr.toggle()
		this.input.tag.toggle()
	}
}
