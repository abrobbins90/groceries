
class GroceryListArea {
	constructor(graph) {
		this.name = "grocery"
		this.graph = graph // graph storing all nodes
		this.menuCloset = new Closet(this, { // keep track of all menu nodes
			"appendLocation": "#menuField",
			"className": "meal_onMenu",
			"isDraggable": true,
			"isBoxXable": true,
			"XAction": searchArea.launchSearch,
			"onSelectionChange": function(){this.groceryCloset.update()}.bind(this),
			"shouldBeHighlighted": function(mainBox) {
				for (let node in mainBox.node.edges) {
					for (let box in node.boxes) {
						if (box.closet === this.groceryCloset && box.selected) {
							return true
						}
					}
				}
				return false
			}.bind(this),
		})
		this.groceryCloset = new Closet(this, { // keep track of all ingredients on menu
			"appendLocation": "#groceryField",
			"className": "ingr_onMenu",
			"isDraggable": false,
			"isBoxXable": true,
			"XAction": this.disable,
			"onSelectionChange": function(){this.menuCloset.update()}.bind(this),
			"shouldBeHighlighted": function(mainBox) {
				for (let node in mainBox.node.edges) {
					for (let box in node.boxes) {
						if (box.closet === this.menuCloset && box.selected) {
							return true
						}
					}
				}
				return false
			}.bind(this),
		})
	}

	// Add meal to menu
	addNodeToMenu(node) { // same issue as above
		this.menuCloset.add(node)
	}

	// Go through all meal nodes and find what is on the menu
	getMenu() {
		// Assemble the menu list (meal nodes)
		this.menuCloset.destructBoxes()
		let mealNodes = graph.getNodesByID_partial("meal", "")
		for (let meal of mealNodes) {
			if (meal.inMenu) { // i don't think we need to keep track of what's on the menu by using inMenu anymore.  I think we can just use groceryListArea.menuCloset.boxes to see what's on the menu.  This is the next thing to take a look at and understand better. (todo)
				this.menuCloset.add(meal)
			}
		}
		this.updateGroceryList()
	}

	// Collect grocery list based on the menu
	updateGroceryList() {
		// Clear the quantities for all the ingredients
		let ingrNodes = graph.getNodesByID_partial("ingr", "")
		for (let ingr of ingrNodes) {
			ingr.quantity = 0;
		}

		// Now go through menu and tally up ingredients
		this.groceryCloset.destructBoxes()
		for (let box of this.menuCloset.boxes) {
			let meal = box.node
			for (let node of meal.edges) {
				if (node.type === "ingr") { // Only tally ingredients
					this.groceryCloset.add(node) // add to list
					node.quantity++
				}
			}
		}
	}

}
