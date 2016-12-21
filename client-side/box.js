class Boxes {
	constructor(appendLocation, destructAction=function(){}, className) {
		this.appendLocation = appendLocation
		this.destructAction = destructAction
		this.className = className
		this.boxes = []
	}

	add(node) {
		this.boxes.push(
			new Box(node, this.appendLocation, this.destructAction, this.className)
		)
	}

	toPrintableString() {
		// We will populate a blank HTML page with this string and then print it
		let stringArray = []
		for( let box of this.boxes ){
			stringArray.push(box.toPrintableString())
		}
		return stringArray.join("<br /><br />")
	}

	print() {
		let win = window.open()
		win.document.write(this.toPrintableString())
		win.print()
	}

	destructElements() {
		for( let box of this.boxes ){
			box.destructElement()
		}
		this.boxes = []
	}
}

class Box {
	constructor(node, appendLocation, destructAction, className) {
		this.node = node
		this.node.boxes.add(this) // so node is aware of the box and can update it
		this.destructAction = destructAction // a function to perform on removeButton.click
		this.$el = this.constructElement(className)
		// Add click events to the element
		this.clickFlag = 0; // used to keep track of clicks vs dbl clicks
		this.$el.get(0).click(this.click.bind(this));
		// attach element to DOM
		if( typeof appendLocation === "function" ){
			appendLocation = appendLocation(this)
		}
		$(appendLocation).append(this.$el)
		// Allow box to be dragged and dropped (we can make this optional in the future, if there are certain boxes that we don't want to be draggable)
		this.$el.get(0).attr("draggable", true)
		this.$el.get(0).on("dragstart", function(event) {
			event.originalEvent.dataTransfer.setData("text", event.target.id);
		})
	}

	constructElement(className="") {
		return $("<div/>")
			.attr("id", this.id)
			.append(this.constructContents())
			.append(this.constructRemoveButton())
			.addClass(className)
			.addClass(this.node.type + "_box")
	}

	constructContents() {
		let box = this // i don't know if this is needed or not.  try without later.
		return $("<div/>")
			.html(box.contents)
			.addClass("box_contents")
	}

	constructRemoveButton() {
		// Add button to destructAction the item if need be
		return $("<div/>")
			.attr("type", "button")
			.html("&times;")
			.addClass("rmItemButton")
			.click(this.destruct.bind(this))
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
		if (this.quantity > 1) {
			// if multiple entries, bold and include x#
			string = string + "<span style='font-weight: bold;'>" + " x" + this.quantity + "</span>"
		}
		return string
	}

	get id() {
		return "box_el_" + this.node.id
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

	destructElement() {
		this.$el.remove()
	}

	destruct() {
		this.destructAction(this.node.type, this.node.name)
		this.destructElement()
		this.node.boxes.delete(this)
	}
}

