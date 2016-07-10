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
		this.graph = graph;
		this.boxes = new Boxes(this.removeEdge.bind(this));
		this.input = new Input();
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
			/*this.input[type].addClass("node_input " + type + "_box") if this comment causes no issues, delete this line */
		}

		this.updateDisplay(shownName);

		if( type === 'meal' ){
			// Put focus on new ingredient field, assuming that's next!
			this.input.ingr.focus()
		}

		ws.send({command: 'add-node', node: node.as_dict()})
		return node
	}

	// [ACTION: Remove Meal Button] Remove a recipe
	removeMeal(mealNode = this.selectedMeal) {
		// mealNode : node object of meal to be deleted (default meal to delete is current selection)
		this.graph.removeNode(mealNode); // Delete meal
		this.updateDisplay("");
		this.input.meal.focus();
	}

	// [ACTION: Remove node edge] Remove an ingr or tag from a menu
	removeEdge(type, name) {
		let node = this.graph.getNodeByID(type, name);
		if( node === -1 || this.selectedMeal === -1 ){
			throw 'No such node.'
			return false
		}
		this.graph.removeEdge(this.selectedMeal, node);
		if (node.edges.size === 0) {
			this.graph.removeNode(node);
		}
		this.updateDisplay(name);
		this.input[type].focus();
	}

	/////////////////////////

	// search for existing nodes to match shownName
	search(type, shownName) {
		let name = nameTrim(shownName)
		if( !name ) return false

		if (type === "meal") {
			// If it's a meal search, update display
			this.updateDisplay(shownName);
		}
		else {
			// Otherwise, check to see if the node exists. If so, mark as selected
			let node = this.graph.getNodeByID(type, name);
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

	// Remove all nodes from view
	clearDisplay() {
		// Update meal input box
		this.input.mealButton.val("Add New Meal");
		/*this.input.mealButton.click(recipe.createMeal); also delete if no probs */
		// Make meal name unselected
		this.input.meal.addClass("node_input");

		this.boxes.destroy()

		this.input.ingr.css("display", "none");
		this.input.tag.css("display", "none");
	}

	// Show all nodes connected to selected meal
	updateDisplay(shownName) {
		let mealNode = this.selectedMeal;
		if( mealNode === -1 ){
			this.clearDisplay()
			return
		}

		// Update meal input box
		this.input.mealButton.value = "Remove Meal";
		this.input.mealButton.click(recipe.removeMeal);
		// Also highlight meal name
		this.input.meal.addClass("node_selected");

		// Show meal recipe
		this.boxes.destroy()
		for (let node of mealNode.edges) {
			this.boxes.add(node)
		}

		// Also show the new ingr and new tag fields
		this.input.ingr.css("display", "inline");
		this.input.tag.css("display", "inline");
		this.search("ingr", shownName);
		this.search("tag", shownName);
	}
}
