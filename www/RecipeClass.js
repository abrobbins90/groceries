//Class for all recipe handling in groceries

class RecipeClass {
	constructor (graph) {
		this.graph = graph;
		this.boxElements = []; // TO BE CHANGED BY MATT LATER
		this.input = { // make relevant DOM objects easily accessible
			meal: document.getElementById("meal_input"),
			ingredient: document.getElementById("ingredient_input"),
			tag: document.getElementById("tag_input"),
			mealButton: document.getElementById("meal_button"),
		};
	}

	/////////////////// HELPERS ///////////////////
	cleanName(type) {
		let cleanName = nameTrim(this.input[type].value)
		if( cleanName === "" ) return false
		return cleanName
	}

	////////////////////////////// Node/Edge Creation/Deletion Functions
	// Note I also combined the keypress function to make one, but I have an if statement to
	// control which function is called. You might want to combine these somehow.
	createNode(type) {
		// Check to see if there is anything worthy in the box
		let nameToAdd = this.cleanName(type)
		if( !nameToAdd ) return false

		let node = this.graph.addNode(type, nameToAdd);
		return node
	}

	// [ACTION: Add Meal Button] Add a new meal node
	createMeal() {
		// On press of the add meal button, read the contents of the text box for the new meal and add
		// it to the meal nodes
		if( !this.createNode("meal") ) return false

		this.updateDisplay();
		// Put focus on new ingredient field, assuming that's next!
		this.input.ingredient.focus();
	}

	// the temporary method I made up
	createNotMeal(type) {
		let node = this.createNode(type)
		if( !node ) return false

		// Add edge
		this.graph.addEdge(this.selectedMeal, node);
		this.input[type].value = ""; // clear entry box
		this.input[type].setAttribute("class", "menu_input_box " + type + "_box");

		this.updateDisplay();
	}

	// [ACTION: Remove Meal Button] Remove a recipe
	removeMeal(mealNode) {
		// mealNode : node object of meal to be deleted (default meal to delete is current selection)
		this.graph.removeNode(mealNode); // Delete meal
		this.updateDisplay();
		this.input.meal.focus();
	}


	// [ACTION: Remove node edge] Remove an ingredient or tag from a menu
	removeEdge(type, name) {
		let node = this.graph.getNodeByID(type, name);
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
			if (node === -1) {$("#" + this.input[type].id).removeClass("node_selected");}
			else {$("#" + this.input[type].id).addClass("node_selected");}
		}
	}

	// Figure out what meal is selected, or if there is none
	get selectedMeal() {
		// Check what meal node is referenced in the meal input box
		return this.graph.getNodeByID("meal", this.cleanName("meal"));
	}

	////////// Recipe Display Functions

	// Show all nodes connected to selected meal
	updateDisplay() {
		let mealNode = this.selectedMeal;
		if (mealNode === -1) {this.clearRecipeArea(); return}

		// Update meal input box
		this.input.mealButton.value = "Remove Meal";
		this.input.mealButton.setAttribute("onclick", "removeMeal()");
		// Also highlight meal name
		$("#" + this.input.meal.id).addClass("node_selected");

		// Show meal recipe
		let i = 0; // keep track of which box element we're on
		for (let node of mealNode.edges) {

			// Check to see if there is an available element to show this node
			// If not, make one
			if (i + 1 > this.boxElements.length) {
				this.boxElements[i] = document.createElement("div");
				this.boxElements[i].setAttribute("id", "boxElement" + i);
			}
			else {
				while (this.boxElements[i].firstChild) {
				this.boxElements[i].removeChild(this.boxElements[i].firstChild);
				}
			}
			// set class and parent element based on type
			this.boxElements[i].setAttribute("class", "menu_item_box " + node.type + "_box");

			// Inside the box, put the name to be shown and the delete button for the item
			let contents = document.createElement("div");
			contents.appendChild(document.createTextNode(node.shownName));
			contents.setAttribute("class", "box_contents");

			// Also add button to remove the item if need be
			let rmButton = document.createElement("input");
			rmButton.setAttribute("type", "button");
			rmButton.setAttribute("class", "rmItemButton");
			rmButton.setAttribute("value", "\u2716");
			rmButton.setAttribute("onclick", "recipe.removeEdge('" + node.type + "', '" + node.name + "')");

			// Add all elements and show
			document.getElementById(node.type + "_entry").appendChild(this.boxElements[i]);
			this.boxElements[i].appendChild(contents);
			this.boxElements[i].appendChild(rmButton);
			this.boxElements[i].style.display = "inline";

			i++; // update to be number of box elements gone through
		}
		// Ensure the rest of the boxElements that might exist are not displayed
		for (i = mealNode.edges.size; i < this.boxElements.length; i++) {
			this.boxElements[i].style.display = "none";
		}

		// Also show the new ingredient and new tag fields
		this.input.ingredient.style.display = "inline";
		this.input.tag.style.display = "inline";
	}
	// Remove all nodes from view
	clearRecipeArea() {
		// Update meal input box
		this.input.mealButton.value = "Add New Meal";
		this.input.mealButton.setAttribute("onclick", "createMeal()");
		// Make meal name unselected
		this.input.meal.setAttribute("class", "menu_input_box");

		for (let i in this.boxElements) {
			this.boxElements[i].style.display = "none";
		}
		this.input.ingredient.style.display = "none";
		this.input.tag.style.display = "none";
	}


}
