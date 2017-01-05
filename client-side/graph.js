// This file holds the classes Graph, Node, and subclasses of Node: MealNode, IngrNode, and TagNode

// Define graph to deal with all node operations
class Graph {
	constructor() {
		this.nodes = new Set(); // List of all nodes
	}

	// Add Nodes
	addNode(type, shownName) {
		// Clean up input
		shownName = cleanName(shownName);

		// Check if node exists already
		var node = this.getNodeById(type + "_" + nameTrim(shownName))
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

		for (let box of node.boxes) {
			box.destruct()
		}

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
	getNodeById(id) {
		for (let node of this.nodes) {
			if( node.id === id ) return node
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

	// Warning, this will clear ALL nodes
	wipe() {
		for (node of this.nodes) {
			for (let box of node.boxes) {
				box.destruct()
			}
		}
		this.nodes = new Set()
	}

}

class Node {
	// A node possesses various properties, as well as edges to other nodes
	// This node is meant to be a superclass
	constructor(shownName = '', type) {

		// Default Initializations
		this.type = type // Declare node type: "meal", "ingr", or "desc"
		this.edges = new Set()
		this.boxes = new Set()
		this.shownName = shownName
		this.info = {} // dictionary with relevant information about the node
	}

	asDict() {
		return {
			shownName: this.shownName,
			type: this.type,
			id: this.id,
		}
	}

	//method to change name of item
	set shownName(newName) { //update true name
		this._shownName = newName;
		// make sure all boxes get the new shownName
		for( let box of this.boxes ) box.update()
	}
	get shownName() {
		return this._shownName
	}
	get name() {
		return nameTrim(this.shownName)
	}
	get id() {
		return this.type + '_' + this.name
	}

}

class MealNode extends Node {
	// Define a subclass of node specific to meals
	constructor(shownName) {
		super(shownName, 'meal');
		this.info = {"instructions" : ""}
	}

	get inMenu() {
		for (let box of this.boxes) {
			if (box.closet === groceryArea.menuCloset) {return true}
		}
		return false
	}

}

class IngrNode extends Node {
	// Define a subclass of node specific to ingrs
	constructor(shownName) {
		super(shownName, 'ingr');
		this.quantity = 0;
	}
}

class TagNode extends Node {
	// Define a subclass of node specific to tag
	constructor(shownName) {
		super(shownName, 'tag');
	}
}
