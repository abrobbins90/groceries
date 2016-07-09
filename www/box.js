class Boxes {
	constructor(removeAction=function(){}) {
		this.removeAction = removeAction
		this.boxes = []
	}

	add(node) {
		this.boxes.push(new Box(node, this.removeAction))
	}

	destroy() {
		for( let box of this.boxes ){
			box.destroy()
		}
		this.boxes = []
	}

	toPrintableString() {
		// We will populate a blank HTML page with this string and then print it
		let stringArray = []
		for( let box of this.boxes ){
			stringArray.push(box.toPrintableString())
		}
		return stringArray.join("<br /><br />")
	}
}

class Box {
	constructor(node, removeAction) {
		this.node = node
		this.removeAction = removeAction // a function to perform on removeButton.click
		this.$el = this.constructElement()
		// attach element to DOM
		$("#" + this.node.type + "_entry").append(this.$el)
	}

	constructElement() {
		return $("<div/>")
			.attr("id", this.id)
			.append(this.constructContents())
			.append(this.constructRemoveButton())
			.addClass("menu_item_box")
			.addClass(this.node.type + "_box")
	}

	constructContents() {
		return $("<div/>")
			.html(this.node.shownName)
			.addClass("box_contents")
	}

	constructRemoveButton() {
		// Add button to removeAction the item if need be
		return $("<div/>")
			.attr("type", "button")
			.html("&times;")
			.addClass("rmItemButton")
			.click(this.remove.bind(this))
	}

	toPrintableString() {
		// any modifications for printing can go here
		return this.node.shownName
	}

	get id() {
		return "box_el_" + this.node.id
	}

	remove() {
		this.removeAction(this.node.type, this.node.name)
		this.destroy()
	}

	destroy() {
		this.$el.remove()
	}
}

