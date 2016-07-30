// This file holds the classes Graph, Node, and subclasses of Node: MealNode, IngrNode, and TagNode

// Define graph to deal with all node operations
class Graph {
	constructor() {
		this.nodes = new Set(); // List of all nodes
	}

	// Add Nodes
	addNode(type, shownName) {
		// Check if node exists already
		var node = this.getNodeByID(type, nameTrim(shownName))
		if( node ) return node

		if (type === "meal") node = new MealNode(shownName)
		else if (type === "ingr") node = new IngrNode(shownName)
		else if (type === "tag") node = new TagNode(shownName)
		this.nodes.add(node)
	
		// Update server
		server.send('add-node', node.asDict())
	
		return node
	}

	// Remove Nodes
	removeNode(node) {
		if (!this.nodes.delete(node)) {return} // Abort if object doesn't exist

		node.selfDestruct(); // Delete DOM element
		if (node.type === "meal") {
			// Remove its edges
			for (let neighbor of node.edges) {
				this.removeEdge(node, neighbor);
			}
		}
		// Update server
		server.send('remove-node', {id: node.id})
	}

	// Search a node by name
	getNodeByID(type, name) {
		for (let node of this.nodes) {
			if( node.id === type + "_" + name ) return node
		}
		return false // not found
	}
	// Search a node by partial name
	getNodesByID_partial(type, str) {
		var nodeList = []
		var RE = new RegExp(str);
		for (let node of this.nodes) {
			if (node.type !== type) {continue}
			// test str in node name
			if (RE.test(node.name)) {
				nodeList.push(node);
			}
		}
		return nodeList
	}



	// Deal with edges (edges)
	addEdge(node1, node2) {
		node1.edges.add(node2);
		node2.edges.add(node1);
		// Update server
		server.send('add-edge', {id1: node1.id, id2: node2.id})
	}
	removeEdge(node1, node2) {
		node1.edges.delete(node2);
		node2.edges.delete(node1);
		// Update server
		server.send('remove-edge', {id1: node1.id, id2: node2.id})
	}
	isConnected(node1, node2) {
		if (node1.edges.has(node2)) { return true }
		return false
	}

}

// Define a node
class Node {
	// Define an instance of a node
	// A node possesses various properties, as well as edges to other nodes
	// This node is meant to be a superclass
	constructor(shownName = '', type) {

		// Default Initializations
		this.type = type; // Declare node type: "meal", "ingr", or "description"
		this.element = $( document.createElement("div") ); // Create an element to be displayed on the page
		this.shownName = shownName;
		this.edges = new Set();

		this.chosen = false; //track whether this node is selected
		this.found = false; // 1 if in current search results. 0 otherwise

		this.xstart = 0; //root location
		this.ystart = 0;
		this.xpos = 0;
		this.ypos = 0;

		this.sendToLimbo();	// store object in limbo (not visible)
	}

	asDict() {
		return {
			shownName: this.shownName,
			type: this.type,
			id: this.id,
		}
	}

	// Setters

	//method to change name of item
	set shownName(newName) { //update true name
		this._shownName = newName;
		this.element.attr("id", this.id);
		this.updateElement();
	}

	// Getters
	get shownName() {
		return this._shownName
	}
	get name() {
		return nameTrim(this.shownName)
	}
	get id() {
		return this.type + '_' + this.name
	}


	//update innerHTML and dimensions
	updateElement() {
		this.element.html(this._shownName);
		this.hrad = this.element.width() / 2;  //horizontal radius
		this.vrad = this.element.height / 2;  //vertical radius
	}

	// put node in limbo (hidden from view)
	sendToLimbo() {
		this.chosen = false;
		this.found = false;
		$("#limbo").append(this.element);
	}
	// Delete element
	selfDestruct(){
		this.element.remove();
	}

	//updates object coordinates
	toStart() {
		this.xpos = this.xstart;
		this.ypos = this.ystart;
		this.draw();
	}
	//updates actual object location in window
	draw() {
		this.element.css("left", this.xpos - this.hrad);
		this.element.css("top", this.ypos - this.vrad);
	}


}

class MealNode extends Node {
	// Define a subclass of node specific to meals
	constructor(shownName) {
		super(shownName, 'meal');
		this.element.addClass("meal_text word_text");

		this.inMenu = false; // store whether meal node is in the menu or not
	}

	// add meal to search results
	addToMealResults() {
		this.found = true;
		this.inMenu = false;

		$("#search_results").append(this.element);
		this.element.removeClass("meal_onMenu_text");
		this.element.addClass("meal_text");
	}

	// Add meal to menu
	addToMenu() {
		this.inMenu = true;
		this.chosen = false;

		$("#menuField").append(this.element);
		this.element.addClass("meal_onMenu_text");
		this.element.removeClass("meal_text");
	}
}



class IngrNode extends Node {
	// Define a subclass of node specific to ingrs
	constructor(shownName) {
		super(shownName, 'ingr');
		this.quantity = 0;

		this.element.addClass("ingr_text word_text");
	}

	// Add ingr to grocery list
	addToGroceryList() {
		this.chosen = 0;

		$("#groceryField").append(this.element);
		this.element.removeClass("ingr_onMenu_text");
		this.element.addClass("ingr_text");
	}

	//update innerHTML and dimensions (overwrite superclass method)
	updateElement() {
		if (this.quantity > 1) {
			// if multiple entries, bold and include x#
			this.element.html(this._shownName + "<b>" + " x" + quan + "</b>");
		}
		else {
			this.element.html(this._shownName);
		}

		this.hrad = this.element.width() / 2;  //vertical radius
		this.vrad = this.element.height() / 2;  //horizontal radius
	}

}

class TagNode extends Node {
	// Define a subclass of node specific to tag
	constructor(shownName) {
		super(shownName, 'tag');
		this.element.addClass("word_text");
	}
}
