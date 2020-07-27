// This file holds the classes Graph, Node, and subclasses of Node: MealNode, IngrNode, and TagNode

// Define graph to deal with all node operations
class Graph {
	constructor() {
		this.nodes = new Set(); // List of all nodes
	}

	// Add Nodes
	addNode(type, name, nodeData = {}) {
		// Check if node exists already
		var node = this.getNodeByName(type, name)
		if( node ) return node

		if (type === "meal") node = new MealNode(name, nodeData)
		else if (type === "ingr") node = new IngrNode(name, nodeData)
		else if (type === "mealTag") node = new MealTagNode(name, nodeData)
		else if (type === "ingrTag") node = new IngrTagNode(name, nodeData)
		this.nodes.add(node)

		// Update server
		server.send('add-node', node.asDict())

		return node
	}

	// Remove Nodes
	removeNode(node) {
		if (!this.nodes.delete(node)) {return} // Abort if object doesn't exist

		// Have node delete its own representations (boxes)
		node.remove()

		// Remove edges
		for (let neighbor of node.edges) {
			this.removeEdge(node, neighbor);
		}

		// Update server
		server.send('remove-node', {id: node.id})
	}

	// Search a node by its unique ID
	getNodeById(id) {
		for (let node of this.nodes) {
			if( node.id === id ) return node
		}
		return false // not found
	}
	// Search for a node by name
	getNodeByName(type, name) {
		var nodesByType = this.getNodesByType(type)
		for (let node of nodesByType) {
			if ( node.hasName(name) ) return node
		}
		return false // not found
	}

	// Get list of nodes of a certain type
	getNodesByType(type) {
		var nodeList = []
		for (let node of this.nodes) {
			if (node.type == type) {
				nodeList.push(node);
			}
		}
		return nodeList
	}
	// Search a node by partial name
	getNodesByID_partial(type, str) {
		var nodesByType = this.getNodesByType(type)
		var nodeList = []
		var RE = new RegExp(str);
		for (let node of nodesByType) {
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
		this.nodes.clear() // Deletes all elements
	}

}

class Node {
	// A node possesses various properties, as well as edges to other nodes
	// This node is meant to be a superclass
	constructor(type, name, nodeData = {}) {

		// Initialization
		this.names = new Set() // List of alternate names
		this.edges = new Set() // node objects connected to this node
		this.boxes = new Set() // Any graphic representations on screen for this node
		this.info = { // dictionary for various node information
			version: 1.0,
			creation_date = Date.now(),
			last_modified = Date.now()
		}

		// Set Basic Info
		this.type = type // Declare node type: "meal", "ingr", or "desc"
		this.dispName = name // This is how the name appears to the user


		// Assign unique ID to node and import any node data
		if (nodeData.hasOwnProperty('id')) {
			// If nodeData has the id, assume it is complete and import other properties as well
			this._id = nodeData.id;
			this.names = new Set(nodeData.names);
			this.info = nodeData.info;
			// Convert date from string to date object
			this.info.creation_date = new Date(this.info.creation_date);
		}
		else {
			// Create a unique, immutable ID based on the node type & name
			this._id = type + '_' + name + '_' + getTimeString(true) + getRandomString(4);
		}

	}
	remove() {
		// Remove any physical boxes from display
		for (let box of this.boxes) {
			box.destruct()
		}
	}

	asDict(full = false) {
		let dict = {
			type: this.type,
			dispName: this.dispName,
			names: Array.from(this.names), // make array
			id: this.id,
			info: this.info
		}
		if (full) {
			// Add list of edges' ids
			dict.edges = new Array();
			this.edges.forEach(function(v1,v2,s){this.push(v1.id)}, dict.edges)
		}
	}

	// Determine if name matches node
	hasName(name) {
		return this.names.has(standardizeName(name))
		// *** Can consider adding to this in the future to add plural, etc. for automatic recognition of similar names
	}
	// Add to acceptable names
	addName(name) {
		// Standardize name and add it
		this.names.add(standardizeName(name))
	}
	// Remove acceptable name
	removeName(name) {
		// Standardize name and remove it
		this.names.delete(standardizeName(name))
	}

	//method to change name of item
	set dispName(dispName) { //update true name
		this._dispName = dispName;
		// make sure all boxes get the new shownName
		for( let box of this.boxes ) box.update()
		// Ensure this name is in acceptable names list
		this.addName(dispName)
	}
	get dispName() {
		return this._dispName
	}
	get id() {
		return this._id
	}

}

class MealNode extends Node {
	// Define a subclass of node specific to meals
	constructor(name, nodeData = {}) {
		super('meal', name, nodeData);

		// The meal's recipe is made up of a series of instructions, divided as follows:
		// - Sections: Describes a part of the recipe. May be composed of individual tasks
		// - Tasks: Specific steps appearing in a section
		// - ingredient quantities: how much of an ingredient. May be part of a task, section, or unassigned
		this.recipe = [new RecipeSection(this)];
		this.ingrQuan = {};

		// Check if saved data is provided
		if ( nodeData.hasOwnProperty('recipe') ) {
			this.ingrQuan = nodeData.ingrQuan;
			for (let i=0; i<nodeData.recipe.length; i++) {
				this.recipe[i] = new RecipeSection(this);
				this.recipe[i].loadData(nodeData.recipe[i])
			}
		}

	}


	get inMenu() {
		for (let box of this.boxes) {
			if (box.closet === groceryArea.menuCloset) {return true}
		}
		return false
	}
	get info() {
		return this._info
	}

	// update server with info
	set info(newInfo) {
		this._info = newInfo
		server.send('update-node-info', {"id": this.id, "info": this._info})
	}

	asDict() {
		dict = super.asDict()
		dict.ingrQuan = this.ingrQuan;
		dict.recipe = []
		// Go through each section and save it
		for (let i=0; i<this.recipe.length; i++) {
			dict.recipe.push(this.recipe[i].asDict())
		}
		return dict
	}

}
class MealTagNode extends Node {
	// Define a subclass of node specific to tag
	constructor(name, nodeData = {}) {
		super('mealTag', name, nodeData)
	}
}

class IngrNode extends Node {
	// Define a subclass of node specific to ingrs
	constructor(name, nodeData = {}) {
		super('ingr', shownName, nodeData)
	}
}
class IngrTagNode extends Node {
	// Define a subclass of node specific to tag
	constructor(name, nodeData = {}) {
		super('ingrTag', name, nodeData)
	}
}

// Classes for recipe instructions
class RecipeSection {
	// A recipe section defines a set of instructions in a recipe
	// Different sections may be concerned with different parts of a recipe
	constructor(meal) {
		// A section is composed of a name, a header, and individual tasks, all of which may be empty
		this.meal = meal; // link to parent
		this.name = ''; // Name of this section (e.g. Prep, Sauce, etc.)
		this.header = ''; // Open field to write whatever, such as an introduction, or if individual tasks are not desired
		this.tasks = []; // A series of numbered, descrete tasks
		this.ingrQuan = {}; // Any ingredients that are tied to this section
	}
	// Save contents
	asDict() {
		var dict = {
			name: this.name,
			header: this.header,
			ingrQuan: this.ingrQuan,
			tasks: []
		}
		for (let i=0; i<this.tasks.length, i++) {
			dict.tasks.push(this.tasks[i].asDict())
		}
		return dict
	}
	// Load in all obejct data from dictionary
	loadData(data) {
		this.name = data.name;
		this.header = data.header;
		this.ingrQuan = data.ingrQuan;
		for (let i=0; i<data.tasks.length, i++) {
			this.tasks[i] = new RecipeTask(this);
			this.tasks[i].loadData(data.tasks[i])
		}
	}
	// Append new empty task
	addTask() {
		this.tasks.push(new RecipeTask(this))
	}
}
class RecipeTask {
	// A recipe task defines an explicit step in a recipe, such as adding together milk, sugar, and eggs
	// The tasks may be explicitly tied to quantities
	constructor(section) {
		this.section = section; // link to parent
		this.instruction = ''; // Text of the provided task
		this.ingrQuan = {}; // Any ingredients that are tied to this task

	}

	asDict() {
		var dict = {
			instruction: this.instruction,
			ingrQuan: this.ingrQuan
		}
		return dict
	}
	// Load in all obejct data from dictionary
	loadData(data) {
		this.instruction = data.instruction;
		this.ingrQuan = data.ingrQuan;
	}
}
