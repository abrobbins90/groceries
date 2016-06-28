// This file holds the classes Graph, Node, Menu, Meal, Ingredient, and Description

// Define graph to deal with all node operations
class GraphClass {
	constructor() {
		this.mealNodes = new Set(); // List of all meal nodes
		this.ingrNodes = new Set(); // List of all ingredient nodes
		this.descNodes = new Set(); // List of all description nodes
	}
	
	///// Methods
	
	addMeal(mealName) {
		var mealNode = new MealNode(mealName);
		this.mealNodes.add(mealNode);
		return mealNode
	}
	addIngr(ingrName) {
		var ingrNode = new IngrNode(ingrName);
		this.ingrNodes.add(ingrNode);
		return ingrNode
	}
	addDesc(descName) {
		var descNode = new DescNode(descName);
		this.descNodes.add(descNode);
		return descNode
	}
	
	removeMeal(mealNode) {
		// Remove mealNode from mealNodes
		// Remove any edges between mealNode and other nodes
		
		// Delete meal
		if (!this.mealNodes.delete(mealNode)) {return} // Abort if object doesn't exist
		
		// Delete meal's DOM element
		mealNode.selfDestruct();
		
		// Remove its connections
		for (let node of mealNode.connections) {
			this.removeConnection(mealNode, node);
		}
	}
	
	// Return a node if it exists in the appropriate list, search by its name
	getMealNodeByName(mealName) {
		return this.getNodeByName(this.mealNodes, mealName)
	}
	getIngrNodeByName(ingrName) {
		return this.getNodeByName(this.ingrNodes, ingrName)
	}
	getDescNodeByName(descName) {
		return this.getNodeByName(this.descNodes, descName)
	}
	getNodeByName(nodeList, name) {
		for (let node of nodeList) {
			if (node.name == name) {return node}
		}
		return -1 // not found
	}
	
	
	// Deal with connections (edges)
	addConnection(node1, node2) {
		node1.connections.add(node2);
		node2.connections.add(node1);
	}
	removeConnection(node1, node2) {
		node1.connections.delete(node2);
		node2.connections.delete(node1);
	}
	isConnected(node1, node2) {
		if (node1.connections.has(node2)) { return true }
		return false
	}
	
}

// Define a node
class NodeClass {
	// Define an instance of a node
	// A node possesses various properties, as well as connections to other nodes
	// This node is meant to be a superclass
	constructor(name = '', type) {	

		// Default Initializations
		this.type = type; // Declare node type: "meal", "ingredient", or "description"
		this.element = document.createElement("div"); // Create an element to be displayed on the page
		this.shownName = name;
		this.connections = new Set();
		
		this.chosen = 0; //track whether this node is selected this.hrad = 0;
		this.found = 0; // 1 if in current search results. 0 otherwise this.vrad = 0;

		this.xstart = 0; //root location
		this.ystart = 0;
		this.xpos = 0;
		this.ypos = 0;
	
		this.sendToLimbo();	// store object in limbo (not visible)
	}

	// Setters
	
	//method to change name of item
	set shownName(newName) { //update true name
		this._shownName = newName;
		this.element.setAttribute("id", this.id);
		this.updateElement();
	}

	// Getters
	get shownName() {
		return this._shownName
	}
	get id() {
		return "ID_" + this.type + '_' + this.name
	}
	get name() {
		return name_trim(this._shownName)
	}


	//update innerHTML and dimensions
	updateElement() {
		this.element.innerHTML = this._shownName;
		this.hrad = this.element.clientWidth / 2;  //vertical radius
		this.vrad = this.element.clientHeight / 2;  //horizontal radius
	}

	// put node in limbo (hidden from view)
	sendToLimbo() {
		document.getElementById("limbo").appendChild(this.element);
	}
	// Delete element
	selfDestruct(){
		// Delete element by putting in limbo, then removing into the void...
		this.sendToLimbo();
		document.getElementById("limbo").removeChild(this.element);
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


}

class MealNode extends NodeClass {
	// Define a subclass of node specific to meals
	constructor(name) {
		super(name, 'meal');
		this.element.setAttribute("class", "meal_text word_text");
		
		this.inMenu = 0; // store whether meal node is in the menu or not
	}
	
	// Add meal to menu
	addToMenu() {
		this.inMenu = 1;
		this.chosen = 0;
		
		document.getElementById("menuField").appendChild(this.element);
		this.element.setAttribute("class","meal_onMenu_text word_text");
	}
	// add meal to search results
	addToMealResults() {
		this.inMenu = 0;
		
		document.getElementById("Results").appendChild(this.element);
		this.element.setAttribute("class","meal_text word_text");
	}
	
}



class IngrNode extends NodeClass {
	// Define a subclass of node specific to ingredients
	constructor(name) {
		super(name, 'ingredient');
		this.quantity = 0;
		
		this.element.setAttribute("class", "ingr_text word_text");
	}
	
	// Add ingredient to grocery list
	addToGroceryList() {
		this.chosen = 0;
		
		document.getElementById("groceryField").appendChild(this.element);
		this.element.setAttribute("class", "ingr_onMenu_text word_text");
	}
	
	//update innerHTML and dimensions (overwrite superclass method)
	updateElement() {
		if (this.quantity > 1) {
			// if multiple entries, bold and include x#
			this.element.innerHTML = this._shownName + "<b>" + " x" + quan + "</b>";
		}
		else {
			this.element.innerHTML = this._shownName;
		}
		
		this.hrad = this.element.clientWidth / 2;  //vertical radius
		this.vrad = this.element.clientHeight / 2;  //horizontal radius
	}
	
}

class DescNode extends NodeClass{
	// Define a subclass of node specific to descriptions
	constructor(name) {
		super( name, 'description');
		this.element.setAttribute("class", "word_text");
	}
}
