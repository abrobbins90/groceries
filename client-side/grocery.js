
class GroceryListArea {
	constructor(graph) {
		this.name = "grocery"
		this.graph = graph // graph storing all nodes
		this.menuCloset = new Closet({ // keep track of all menu nodes
			"appendLocation": "#groceryField",
			"className": "meal_onMenu",
			"isDraggable": true,
			"isBoxXable": true,
			"XAction": searchArea.launchSearch, // not sure why this doesn't take the node as input!!!!
		});
		this.groceryCloset = new Closet({ // keep track of all ingredients on menu
			"appendLocation": "cssefhei",
			"className": "ingr_onMenu",
			"isDraggable": false,
			"isBoxXable": true,
			"XAction": this.disable,
		})
	}

	// Add meal to menu
	addNodeToMenu(node) { // same issue as above
		node.selected = false;

		this.menuCloset.add(node)
	}

	// Go through all meal nodes and find what is on the menu
	getMenu() {
		// Assemble the menu list (meal nodes)
		this.menuCloset.destructBoxes()
		let mealNodes = graph.getNodesByID_partial("meal", "")
		for (let meal of mealNodes) {
			if (meal.inMenu) { // if in the menu
				this.menuCloset.add(meal)
			}
		}
		this.getGroceryList()
	}

	// Collect grocery list based on the menu
	getGroceryList() {
		// Clear the quantities for all the ingredients
		let ingrNodes = graph.getNodesByID_partial("ingr", "")
		for (let ingr of ingrNodes) {
			ingr.quantity = 0;
		}

		// Now go through menu and tally up ingredients
		this.groceryCloset.destructBoxes()
		for (let mealNode of this.menuCloset) {
			for (let edge of mealNode.edges) {
				if (edge.type === "ingr") { // Only tally ingredients
					this.groceryCloset.add(edge) // add to list
					edge.quantity++
				}
			}
		}
		this.updateGroceryListDisplay()
	}

	// update display with the grocery list on record
	updateGroceryListDisplay() {
		for (let ingr of this.groceryCloset.boxes) {
			this.selected = false;
		}
		this.groceryCloset.update()
	}

	print() { // i think this function is redundant.  Shouldn't we just call this.groceryCloset.print ?
		let stringArray = []
		for (let ingr of this.groceryCloset) {
			stringArray.push(ingr.element.html())
		}

		let win = window.open()
		win.document.write(stringArray.join("<br>"))
		win.print()
	}
}
