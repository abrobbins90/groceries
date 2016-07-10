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
	constructor (graph) {
		this.graph = graph;
		this.boxes = new Boxes(this.removeEdge.bind(this));
		this.input = new Input();
	}

	/////////////////// HELPERS ///////////////////
	cleanName(type) {
		let cleanName = nameTrim(this.input[type].val())
		if( cleanName === "" ) return false
		return cleanName
	}

	////////////////////////////// Node/Edge Creation/Deletion Functions
	// [ACTION] Add a new node
	createNode(type) {
		// Check to see if there is anything worthy in the box
		let nameToAdd = this.cleanName(type)
		if( !nameToAdd ) return false

		let node = this.graph.addNode(type, this.input[type].val())

		if( type !== 'meal' ){
			// Add edge
			this.graph.addEdge(this.selectedMeal, node)
			this.input[type].val("") // clear entry box
			/*this.input[type].addClass("node_input " + type + "_box") if this comment causes no issues, delete this line */
		}

		this.updateDisplay();

		if( type === 'meal' ){
			// Put focus on new ingredient field, assuming that's next!
			this.input.ingr.focus()
		}

		return node
	}

	// [ACTION: Remove Meal Button] Remove a recipe
	removeMeal(mealNode = this.selectedMeal) {
		// mealNode : node object of meal to be deleted (default meal to delete is current selection)
		this.graph.removeNode(mealNode); // Delete meal
		this.updateDisplay();
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
		this.updateDisplay();
		this.input[type].focus();
	}

	/////////////////////////

	// After pressing a key, check the contents of the box and search for existing nodes to match
	search(type) {
		let name = this.cleanName(type)
		if( !name ) return false

		if (type === "meal") {
			// If it's a meal search, update display
			this.updateDisplay();
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
		// Check what meal node is referenced in the meal input box
		return this.graph.getNodeByID("meal", this.cleanName("meal"));
	}

	////////// Recipe Display Functions

	// Remove all nodes from view
	clearDisplay() {
		// Update meal input box
		this.input.mealButton.val("Add New Meal");
		this.input.mealButton.click(recipe.createMeal);
		// Make meal name unselected
		this.input.meal.addClass("node_input");

		this.boxes.destroy()

		this.input.ingr.css("display", "none");
		this.input.tag.css("display", "none");
	}

	// Show all nodes connected to selected meal
	updateDisplay() {
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
		this.search("ingr");
		this.search("tag");
	}
}
