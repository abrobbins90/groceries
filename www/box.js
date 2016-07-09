class Boxes {
	constructor(removeAction=function(){}, bindee=null) {
		this.removeAction = removeAction
		this.bindee = bindee
		this.boxes = []
	}
	add(node) {
		this.boxes.push(new Box(node, this.removeAction, this.bindee))
	}
	destroy() {
		for( let box of this.boxes ){
			box.destroy()
		}
		this.boxes = []
	}
}

class Box {
	constructor(node, removeAction, bindee) {
		this.node = node
		this.removeAction = removeAction // a function to perform on removeButton.click
		if( bindee ){ // an object to be 'this' when running removeAction
			this.removeAction = this.removeAction.bind(bindee)
		}
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

