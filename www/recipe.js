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

	// search for existing nodes connected to this.selectedMeal
	search(type, shownName) {
		if (type === "meal") {
			if( this.selectedMeal ) this.writeDisplay()
			else this.clearDisplay()
		}
		else {
			// Otherwise, check to see if the node exists. If so, mark as selected
			let name = nameTrim(shownName)
			let node = this.graph.getNodeByID(type, name)
			if( node ) this.input[type].addClass("node_selected")
			else this.input[type].removeClass("node_selected")
		}
	}

	// [ACTION] Add a new node
	createNode(type, shownName) {
		if( !nameTrim(shownName) ) return false

		let node = this.graph.addNode(type, shownName)

		if( type !== 'meal' ){
			this.graph.addEdge(this.selectedMeal, node)
		}

		this.writeDisplay()

		if( type === 'meal' ){
			// Put focus on new ingredient field, assuming that's next!
			this.input.ingr.focus()
		}

		ws.send({command: 'add-node', node: node.asDict()})
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
		let node = this.graph.getNodeByID(type, name)
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
		let shownName = $('#meal_input').val()
		let name = nameTrim(shownName)
		if( !name ) return false

		// Check what meal node is referenced in the meal input box
		return this.graph.getNodeByID("meal", name)
	}

	////////// Recipe Display Functions

	clearDisplay() {
		this.boxes.destroy()

		$('#meal_input').removeClass("node_selected")
		$('#create_meal_button').show()
		$('#remove_meal_button').hide()
		this.input.ingr.hide()
		this.input.tag.hide()
	}

	writeDisplay() {
		this.boxes.destroy()

		this.writeNeighbors()

		$('#meal_input').addClass("node_selected")
		$('#create_meal_button').hide()
		$('#remove_meal_button').show()
		this.input.ingr.show().removeClass("node_selected").val("")
		this.input.tag.show().removeClass("node_selected").val("")
	}

	writeNeighbors() {
		for (let node of this.selectedMeal.edges) {
			this.boxes.add(node)
		}
	}
}
