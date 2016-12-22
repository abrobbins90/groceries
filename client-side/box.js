class Closet {
	// Class Closet represents a collection of instances of class Box
	constructor(area, options) {
		_.default(options, {
			"appendLocation": undefined, // css selector
			"className": "", // single classname to apply to box elements
			"isDraggable": false, // can this box be dragged between areas
			"isBoxXable": false, // should an x-button be drawn in the box
			"XAction": function(){}, // what should happen upon clicking the x
		})
		this.area = area
		this.options = options
		this.boxes = []
	}

	add(node) { // Create a new Box element
		this.boxes.push(
			new Box(node, this, this.options)
		)
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

	destructElements() {
		for( let box of this.boxes ){
			box.destructElement()
		}
		this.boxes = []
	}


}

class Box {
	constructor(node, closet, options) {
		this.node = node
		this.closet = closet
		this.node.boxes.add(this) // so node is aware of the box and can update it
		this.XAction = options["XAction"] // a function to perform on XButton.click
		this.$el = this.constructElement(options)

		// Add click events to the element
		this.clickFlag = 0; // used to keep track of clicks vs dbl clicks
		this.$el.get(0).click(this.click.bind(this));
		
		// attach element to DOM
		appendLocation = options["appendLocation"]
		if( typeof appendLocation === "function" ){
			appendLocation = appendLocation(this)
		}
		$(appendLocation).append(this.$el)

		// Make box draggable if need be
		alert('isDraggable ' + options["isDraggable"])
		if( options["isDraggable"] ){
			this.$el.get(0).attr("draggable", true)
			this.$el.get(0).on("dragstart", function(event) {
				event.originalEvent.dataTransfer.setData("text", event.target.id)
			})
		}
	}

	constructElement(options) {
		let $b = $("<div/>")
			.attr("id", this.id)
			.append(this.constructContents())
			.addClass(options["className"])
			.addClass(this.node.type + "_box")
		if( options["isBoxXable"] ) $b.append(this.constructXButton())
		return $b
	}

	constructContents() {
		return $("<div/>")
			.html(this.contents)
			.addClass("box_contents")
	}

	constructXButton() {
		// Add button to trigger XAction
		return $("<div/>")
			.attr("type", "button")
			.html("&times;")
			.addClass("rmItemButton")
			.click(this.Xaction.bind(this))
	}

	update() {
		this.$el.html(this.contents)
		// any other things that need updating should be added here
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
		return "Box_el_" + "Area_" + this.closet.area.name + "_Node_id_" + this.node.id
	}

	set selected(TF) {
		this._selected = TF;
		if (TF) { // selected
			this.$el.addClass("node_select");
			this.$el.removeClass("node_unselect");
		} else {
			this.$el.addClass("node_unselect");
			this.$el.removeClass("node_select");
		}
	}

	// Events
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

	destruct() {
		//this.destructAction(this.node.type, this.node.name)
		this.$el.remove()
		this.closet.remove(this)
		this.node.boxes.remove(this)
	}
}

