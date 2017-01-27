class Closet {
	// Class Closet represents a collection of instances of class Box
	constructor(area, options) {
		let defaults = {
			"appendLocation": undefined, // css selector
			"className": "", // single classname to apply to box elements
			"isDraggable": false, // can this box be dragged between areas
			"isBoxXable": false, // should an x-button be drawn in the box
			"XAction": function(){}, // what should happen upon clicking the x
			"singleClick": function(event) {this.selected = !this.selected},
			"doubleClick": function(event) {},
		}
		options = $.extend({}, defaults, options)
		this.options = options

		this.area = area
		this.boxes = []
	}

	add(node) { // Create a new Box element
		if (!this.getBoxByNode(node)) {
			this.boxes.push( new Box(node, this, this.options) )
		}
		this.onChange()
	}
	addNodes(nodeList, clear = false) { // add multiple nodes
		// <clear> indicates whether to remove existing nodes/boxes first
		if (clear) { // Clear boxes in the closet not in nodeList
			let boxes = this.boxes.slice()
			let index
			for ( let box of boxes ) {
				index = nodeList.indexOf(box.node)
				if (index === -1) { // not in list
					box.destruct()
				}
				else { // in list already, so clear from nodeList
					nodeList.splice(index, 1)
				}
			}
		}
		// Now add all elements of nodeList
		nodeList.forEach(this.add.bind(this))
		this.onChange()
	}

	removeNode(node) { // remove a box with a particular node
		 let box = this.getBoxByNode(node)
		 if (box) box.destruct()
		 this.onChange()
	}

	destructBoxes() {
		let boxes = this.boxes.slice()
		for( let box of boxes ){
			box.destruct()
		}
	}

	getBoxByNode(node) {
		for( let box of this.boxes ) {
			if( box.node === node ) return box
		}
		return false
	}


	updateBoxes() {
		for( let box of this.boxes ) box.update()
	}

	toPrintableString() {
		// We will populate a blank HTML page with this string and then print it
		let stringArray = []
		for( let box of this.boxes ){
			stringArray.push(box.toPrintableString())
		}
		return stringArray.join("<br />")
	}

	print() {
		let win = window.open()
		win.document.write(this.toPrintableString())
		win.print()
	}

	// default functions that might be overwritten in subclasses
	onSelectionChange() {}
	shouldBeHighlighted(box) {return false}
	onChange() {}
}

class RecipeCloset extends Closet {
	// Define a subclass of closet specific to the recipe area
	constructor(area) {
		let options = {
			"appendLocation": function (box){ return "#" + box.node.type + "_entry"	},
			"className": "recipe_box",
			"isDraggable": false,
			"isBoxXable": true,
			"XAction": function(){
				this.destruct()
				recipe.removeEdge(this.node.type, this.node.name)
			},
			"singleClick": function(event) {},
		}
		super(area, options)
	}

	// save quantity entered for an ingredient
	saveIngrQuantity(box, $quan) {
		let ingrNode = box.node
		let mealNode = recipe.selectedMeal
		let info = mealNode.info
		info[ingrNode.id] = $quan.val()
		mealNode.info = info
	}

}
class SearchCloset extends Closet {
	// Define a subclass of closet specific to the search area
	constructor(area) {
		let options = {
			"appendLocation": "#search_results",
			"className": "search_box",
			"isDraggable": true,
			"isBoxXable": false,
			"XAction": undefined,
			"doubleClick": function(event) {
				let node = this.node
				searchArea.closet.removeNode(node)
				groceryArea.menuCloset.add(node)
			},
		}
		super(area, options)
	}

	onSelectionChange(box) {
		// send the node from this box to the recipe panel for editing
		if (box.selected) recipe.selectMeal(box.node)
	}
}
class MenuCloset extends Closet {
	// Define a subclass of closet specific to the menu area
	constructor(area) {
		let removeFromMenu = function(event) {
			let node = this.node
			groceryArea.menuCloset.removeNode(node)
			searchArea.launchSearch()
		}
		let options = {
			"appendLocation": "#menuField",
			"className": "menuMeal_box",
			"isDraggable": true,
			"isBoxXable": true,
			"XAction": removeFromMenu,
			"doubleClick": removeFromMenu,
		}
		super(area, options)
	}
	onSelectionChange(box) {
		groceryArea.groceryCloset.updateBoxes()
		if (box.selected) recipe.selectMeal(box.node)  // send the node from this box to the recipe panel for editing
	}
	shouldBeHighlighted(mainBox) {
		for (let box of groceryArea.groceryCloset.boxes) {
			if (mainBox.node.edges.has(box.node) && box.selected) {return true}
		}
		return false
	}
	onChange() {
		groceryArea.updateGroceryList()
	}
}
class GroceryCloset extends Closet {
	// Define a subclass of closet specific to the grocery area
	constructor(area) {
		let options = {
			"appendLocation": "#groceryField",
			"className": "menuIngr_box",
			"isDraggable": false,
			"isBoxXable": true,
			"XAction": function() {
				this.disable()
				this.$el.children(".XButton").click(function() {
					this.enable()
					this.$el.children(".XButton").click(this.XAction.bind(this))
				}.bind(this))
			},
		}
		super(area, options)
	}
	onSelectionChange() {
		groceryArea.menuCloset.updateBoxes()
	}
	shouldBeHighlighted(mainBox) {
		for (let box of groceryArea.menuCloset.boxes) {
			if (mainBox.node.edges.has(box.node) && box.selected) {return true}
		}
		return false
	}
}



class Box {
	constructor(node, closet, options) {
		this.node = node
		this.closet = closet
		this.node.boxes.add(this) // so node is aware of the box and can update it
		this.XAction = options["XAction"] // add functions that respond to clicks
		this.singleClick = options["singleClick"]
		this.doubleClick = options["doubleClick"]
		this.$el = this.constructElement(options)
		this.selected = false // keep track of box's selection status (like when user clicks)


		// Add click events to the element
		this.clickFlag = 0; // used to keep track of clicks vs dbl clicks
		this.$el.children("div.box_contents").click(this.click.bind(this));

		// attach element to DOM
		let appendLocation = options["appendLocation"]
		if( typeof appendLocation === "function" ){
			appendLocation = appendLocation(this)
		}
		$(appendLocation).append(this.$el)

		// Make box draggable if need be
		if( options["isDraggable"] ){
			this.$el.attr("draggable", true)
			let box = this
			this.$el.on("dragstart", function(event) {
				// pass along the NODE id
				event.originalEvent.dataTransfer.setData("text/plain", box.node.id)
			})
		}

		this.update()
	}

	constructElement(options) {
		let $b = $("<div/>")
			.attr("id", this.id)
			.append(this.constructContents())
			.addClass("box")
			.addClass(this.node.type + "_box")
			.addClass(options["className"])
		if( options["isBoxXable"] ) {
			$b.addClass("Xable")
			$b.append(this.constructXButton())
		}
		if( options["className"] === "recipe_box" && this.node.type === "ingr") {
			let $q = $("<input/>")
				.attr("type", "text")
				.attr("placeholder", "# of")
				.addClass("ingr_quantity")

			$q.blur(function() {
				let $q = this.$el.children(".ingr_quantity")
				this.closet.saveIngrQuantity(this, $q)
			}.bind(this))

			$b.prepend($q)
		}
		return $b
	}

	constructContents() {
		return $("<div/>")
			.addClass("box_contents")
			// note: the actual text contents are added later in .update
	}

	constructXButton() {
		// Add button to trigger XAction
		return $("<div/>")
			.attr("type", "button")
			.html("&times;")
			.addClass("XButton")
			.click(this.XAction.bind(this))
	}

	update() {
		// Update contents
		this.$el.children(".box_contents").html(this.contents)

		// Update quantity if need be
		let $q = this.$el.children(".ingr_quantity")
		if ($q.length !== 0) {
			$q.val(recipe.selectedMeal.info[this.node.id])
		}

		// Update highlighting
		this.highlighted = this.closet.shouldBeHighlighted(this)
	}

	get contents() {
		let string = this.node.shownName
		if (this.node.type === "ingr") {
			// update
		}

		if (this.$el.hasClass("menuIngr_box") && this.node.grocQuantity > 1) {
			// if multiple entries, bold and include x#
			string = string + "<span>" + " (" + this.node.grocQuantity + ")</span>"
		}
		return string
	}

	get id() {
		return "Box_el_" + "in_Area_" + this.closet.area.name + "_for_Node_" + this.node.id
	}


	destruct() {
		this.selected = false
		this.$el.remove() // delete HTML element
		this.node.boxes.delete(this) // remove box record from node
		let index = this.closet.boxes.indexOf(this) // remove from closet
		this.closet.boxes.splice(index, 1)
	}

	get selected() { return this._selected }

	set selected(TF) {
		this._selected = TF
		if (TF) { // selected
			this.$el.addClass("box_selected")
		} else {
			this.$el.removeClass("box_selected")
		}
		this.closet.onSelectionChange(this)
	}

	get highlighted() { return this._highlighted }

	set highlighted(TF) {
		this._highlighted = TF
		if (TF) {
			this.$el.addClass("box_highlighted")
		}
		else {
			this.$el.removeClass("box_highlighted")
		}
	}

	// Click Events
	click(event) { // Distinguish between single and double clicks
		this.clickFlag++;
		if (this.clickFlag === 1) {
			setTimeout(function() {
				if (this.clickFlag === 1){
					this.singleClick(event)
				}
				else {
					this.doubleClick(event)
				}
				this.clickFlag = 0;
			}.bind(this), 300) // ms delay to qualify as a double click
		}
	}

	disable() { // this greys out the box and makes it uninteractible
		this.$el.addClass("disabled")
	}
	enable() { // this undisables a box
		this.$el.removeClass("disabled")
	}


	toPrintableString() {
		// any modifications for printing can go here
		return this.contents
	}
}

