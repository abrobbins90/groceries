class Closet {
	// Class Closet represents a collection of instances of class Box
	constructor(area, options) {
		let defaults = {
			"appendLocation": undefined, // css selector
			"className": "", // single classname to apply to box elements
			"onSelectionChange": function(){},
			"shouldBeHighlighted": function(){},

			"isDraggable": false, // can this box be dragged between areas
			"isBoxXable": false, // should an x-button be drawn in the box
			"XAction": function(){}, // what should happen upon clicking the x
		}
		options = $.extend({}, defaults, options)
		this.options = options

		this.onSelectionChange = options["onSelectionChange"]
		this.shouldBeHighlighted = options["shouldBeHighlighted"]

		this.area = area
		this.boxes = []
	}

	add(node) { // Create a new Box element
		this.boxes.push(
			new Box(node, this, this.options)
		)
	}

	update() {
		for( box of this.boxes ) box.update()
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

	remove(box) {
		let index = this.boxes.indexOf(box)
		this.boxes.splice(index, 1)
	}

	destructBoxes() {
		for( let box of this.boxes ){
			box.destruct()
		}
	}


}

class Box {
	constructor(node, closet, options) {
		this.node = node
		this.closet = closet
		this.node.boxes.add(this) // so node is aware of the box and can update it
		this.XAction = options["XAction"] // a function to perform on XButton.click
		this.$el = this.constructElement(options)
		this.selected = false // keep track of box's selection status (like when user clicks)


		// Add click events to the element
		this.clickFlag = 0; // used to keep track of clicks vs dbl clicks
		this.$el.get(0).click(this.click.bind(this));

		// attach element to DOM
		let appendLocation = options["appendLocation"]
		if( typeof appendLocation === "function" ){
			appendLocation = appendLocation(this)
		}
		$(appendLocation).append(this.$el)

		// Make box draggable if need be
		if( options["isDraggable"] ){
			this.$el.attr("draggable", true)
			this.$el.on("dragstart", function(event) {
				event.originalEvent.dataTransfer.setData("text", event.target.id)
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
		if( options["isBoxXable"] ) $b.append(this.constructXButton())
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
		this.$el.html(this.contents)

		// Update highlighting
		this.highlighted = this.closet.shouldBeHighlighted(this)
	}

	toPrintableString() {
		// any modifications for printing can go here
		return this.contents
	}

	get contents() {
		let string = this.node.shownName
		if (this.node.quantity > 1) {
			// if multiple entries, bold and include x#
			string = string + "<span style='font-weight: bold;'>" + " x" + this.node.quantity + "</span>"
		}
		return string
	}

	get id() {
		return "Box_el_" + "in_Area_" + this.closet.area.name + "_for_Node_" + this.node.id
	}


	get selected() {
		return this._selected
	}

	set selected(TF) {
		this._selected = TF
		if (TF) { // selected
			this.$el.addClass("box_selected")
		} else {
			this.$el.removeClass("box_selected")
		}
		this.closet.onSelectionChange(this)
	}

	set highlighted(TF) {
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
	singleClick(event) {
		this.selected = !this.selected;
	}
	doubleClick(event) {
		// pass
	}

	disable() { // this greys out the box and makes it uninteractible
		this.$el.addClass("disabled")
	}
	enable() { // this undisables a box
		this.$el.removeClass("disabled")
	}

	destruct() {
		this.$el.remove()
		this.closet.remove(this)
		this.node.boxes.delete(this)
	}
}

