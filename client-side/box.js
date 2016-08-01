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
		this.destructAction = destructAction // a function to perform on removeButton.click
		this.$el = this.constructElement(className)
		// attach element to DOM
		if( typeof appendLocation === "function" ){
			appendLocation = appendLocation(this)
		}
		$(appendLocation).append(this.$el)
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
		return $("<div/>")
			.html(this.node.shownName)
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

	toPrintableString() {
		// any modifications for printing can go here
		return this.node.shownName
	}

	get id() {
		return "box_el_" + this.node.id
	}

	destructElement() {
		this.$el.remove()
	}

	destruct() {
		this.destructAction(this.node.type, this.node.name)
		this.destructElement()
	}
}

