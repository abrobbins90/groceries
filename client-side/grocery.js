
class GroceryListArea {
	constructor(graph) {
		this.name = "grocery"
		this.graph = graph // graph storing all nodes
		this.menuCloset = new Closet({ // keep track of all menu nodes
			"appendLocation": ".cssstring",
			"className": "meal_onMenu",
			"isDraggable": true,
			"isBoxXable": true,
			"XAction": dropInSearchArea,
		})
		this.groceryCloset = new Closet({ // keep track of all ingredients on menu
			"appendLocation": "cssefhei",
			"className": "meal_ingrAreaaaa",
			"isDraggable": false,
			"isBoxXable": true,
			"XAction": geryOut,
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
		this.menuCloset = new Set();
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
		this.groceryCloset = new Set()
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

		// Now update grocery list display
		for (let ingr of this.groceryCloset) {
			// First update its display quantity
			ingr.updateElement()
			// Then ensure it is in the grocery list display window
			ingr.addToGroceryList()
		}

		// To finish, go through ingredients one more time, removing any
		// not in the grogery list and ensuring they are hidden
		let ingrNodes = graph.getNodesByID_partial("ingr", "")
		for (let ingr of ingrNodes) {
			if (ingr.quantity === 0) {
				for( let box of ingr.closet ) box.update()
				for( let box of ingr.closet ) selected = false // or maybe just for the box in grocery list
				box.destruct()
			}
		}
	}


	print() {
		let stringArray = []
		for (let ingr of this.groceryCloset) {
			stringArray.push(ingr.element.html())
		}

		let win = window.open()
		win.document.write(stringArray.join("<br>"))
		win.print()
	}
}
