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

	// stuff for connection-force
	get foundNodes() {
		let found_node_list = []
		for( let node of this.nodes )if( node.found ){
			found_node_list.push(node)
		}
		return found_node_list
	}
	clearFoundNodes() {
		for( let node of this.nodes ){
			node.found = false
		}
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
		this.edges = new Set();
		this.boxes = new Set();
		this.shownName = shownName;

		this.selected = false; //track whether this node is selected

		// These are for connection-force.js animation (as well as one CoordBox that will be created by the animation and added to this.boxes)
		this.chosen = false
		this.found = false
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

	// Update element appearance based on whether it is selected or not
	set selected(TF) {
		this.updateSelection(TF);
	}
	updateSelection(TF) {
		this._selected = TF;
		for( let box of this.boxes ) box.selected = TF
	}
	get selected() {
		return this._selected
	}
}

class MealNode extends Node {
	// Define a subclass of node specific to meals
	constructor(shownName) {
		super(shownName, 'meal');

		this.inMenu = false; // store whether meal node is in the menu or not
		this.inResults = false; // store whether meal node is in a search
	}

	set selected(TF) {
		this.updateSelection(TF) // i think we can use super.selected = TF instead
		if (this.selected) {
			// make this selected in the recipe panel
			recipe.selectMeal(this)
		}
	}

	set inMenu(val) {
		this._inMenu = val;
		// If something is being moved in or out of the menu, update grocery list
		groceryArea.getMenu()
	}
	get inMenu() {
		return this._inMenu
	}

	// add meal to search results
	addToMealResults() { // searchArea should have an addMeal like method, instead of this.
		this.inResults = true;
		this.inMenu = false;

		$("#search_results").append(this.element);
		this.element.removeClass("meal_onMenu");
		this.element.addClass("meal_search");
	}

	// Events
	// doubleClick(event) { // for now, just dragging functionality is fine
	// 	if (this.inMenu === false) { // Transfer to the menu
	// 		this.addToMnu() // replaced with menu area thingy....
	// 	} else { // Remove from menu; relaunch search in case meal is in results
	// 		this.sendToLimbo()
	// 		searchArea.launchSearch()
	// 	}
	// }
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
