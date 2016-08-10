
class GroceryListArea {
	constructor(graph) {
		this.graph = graph // graph storing all nodes
		this.menuList = new Set() // keep track of all menu nodes
		this.groceryList = new Set() // keep track of all ingredients on menu
	}

	// Go through all meal nodes and find what is on the menu
	getMenu() {
		
		// Assemble the menu list (meal nodes)
		this.menuList = new Set();
		let mealNodes = graph.getNodesByID_partial("meal", "")
		for (let meal of mealNodes) {
			if (meal.inMenu) { // if in the menu
				this.menuList.add(meal)
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
		this.groceryList = new Set()
		for (let mealNode of this.menuList) {
			for (let edge of mealNode.edges) {
				if (edge.type === "ingr") { // Only tally ingredients
					this.groceryList.add(edge) // add to list
					edge.quantity++
				}
			}
		}
		this.updateGroceryListDisplay()
	}
	
	// update display with the grocery list on record
	updateGroceryListDisplay() {

		// Now update grocery list display
		for (let ingr of this.groceryList) {
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
				ingr.updateElement()
				ingr.sendToLimbo()
			}
		}
	}
	
	
	print() {
		let stringArray = []
		for (let ingr of this.groceryList) {
			stringArray.push(ingr.element.html())
		}
		
		let win = window.open()
		win.document.write(stringArray.join("<br>"))
		win.print()
	}
}
