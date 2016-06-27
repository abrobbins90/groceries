// This file holds the classes Graph, Node, Menu, Meal, Ingredient, and Description

class Graph {
	// constructor() {
	// 	this.nodes = new Set();
	// 	this.edges = new Set();
	// }
	// addNode(n) {
	// 	// first check n is really a node, then:
	// 	// check node not already in graph, then:
	// 	this.nodes.add(n)
	// }
	// addEdge(


	// areConnected(n1, n2) {
	// 	// see if the set {n1, n2} exists in edges

	// ACTUALLY, LET'S JUST USE JSNETWORKX
}

// Define an instance of a node
class Node {
	// A node possesses various properties, as well as connections to other nodes
	// This node is meant to be a superclass

	constructor(shownName, type, graph) {
		// Default Initializations
		this.shownName = shownName;
		this.type = type; // "meal", "ingredient", or "description"
		this.graph = graph; // the big Graph object that this node belongs to

		this.chosen = 0; //track whether this node is selected this.hrad = 0;
		this.found = 0; // 1 if in current search results. 0 otherwise this.vrad = 0;

		//set html element properties this.chosen = 0; //track whether this node is selected
		this.element = document.createElement("div"); // Create an element to be displayed on the page this.found = 0; // 1 if in current search results. 0 otherwise
		this.xstart = -500; //root location
		this.ystart = -500;
		this.xpos = -500;
		this.ypos = -500;

		this.sendToLimbo();
	}

	set shownName(newName) { //update true name
		this.name = name_trim(newName);
		this.shownName = newName;
		this.element.setAttribute("id", this.id);
		this.element.setAttribute("onclick", "choose(event)");
		this._updateDim();
	}

	get id() {
		return "ID_" + type + '_' + this.name
	}

	//update innerHTML and dimensions
	_updateDim() {
		this.element.innerHTML = this.shownName;
		this.hrad = this.element.clientWidth / 2;  //vertical radius
		this.vrad = this.element.clientHeight / 2;  //horizontal radius
	}

	// put node in limbo (hidden from view)
	sendToLimbo() {
		document.getElementById("limbo").appendChild(this.element);
	}

	//updates object coordinates
	toStart() {
		this.xpos = this.xstart;
		this.ypos = this.ystart;
		this.draw();
	}

	//updates actual object location in window
	draw() {
		this.element.style.left = this.xpos - this.hrad;
		this.element.style.top = this.ypos - this.vrad;
	}

	// check connection
	isConnected(that) {
		return this.graph.areConnected(this, that)
	}

	// Add connections
	addConnections(nodeList) {
		this.graph.addConnections(this, nodeList)
	}

	// Remove connections
	removeConnections(nodeList) {
		this.graph.removeConnections(this, nodeList)
	}
}

// Define a subclass of node specific to meals
class Meal extends Node {
	constructor(name) {
		Node.call(this, name, 'meal', graph);
		this.element.setAttribute("class", "meal_text word_text");

		///// additional properties
		this.inMenu = 0; // store whether meal node is in the menu or not
	}

	// Add meal to menu
	addToMenu() { // there should be a Menu class that holds Meals.  The Menu object would know which meals it stores.  So this functionality should be moved to the Menu class.  We can always have a shortcut function here if convenient.
		this.inMenu = 1;
		this.chosen = 0;

		document.getElementById("menuField").appendChild(this.element);
		this.element.setAttribute("class","meal_onMenu_text word_text");
	}
	// add meal to search results
	addToMealResults() { // same as above
		this.inMenu = 0;

		document.getElementById("Results").appendChild(this.element);
		this.element.setAttribute("class","meal_text word_text");
	}

}

// Define a subclass of node specific to ingredients
class Ingredient extends Node {

	constructor(name) {
		Node.call(this, name, 'ingredient', graph);

		this.element.setAttribute("class", "ingr_text word_text");
	}

	// Add ingredient to grocery list
	addToGroceryList() { // do we need a GroceryList class?  is that different than the Menu class?
		this.chosen = 0;

		document.getElementById("groceryField").appendChild(this.element);
		this.element.setAttribute("class", "ingr_onMenu_text word_text");
	}

	//update shown name based on item quantity
	quantityChange(quan) {
		if (quan > 1) {this.shownName = "<b>" + this.name + " x" + quan + "</b>";} //name x3
		else {this.shownName = this.name;}
		this._updateDim();
	}
}

// Define a subclass of node specific to descriptions
class Description extends Node {

	constructor(name) {
		Node.call(this, name, 'description', graph);

		this.element.setAttribute("class", "word_text");
	}
}

