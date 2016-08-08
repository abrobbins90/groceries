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

		this.selected = false; //track whether this node is selected

		this.xstart = 0; //root location
		this.ystart = 0;
		this.xpos = 0;
		this.ypos = 0;

		this.sendToLimbo();	// store object in limbo (not visible)
		
		// Add click events to the element
		this.clickFlag = 0; // used to keep track of clicks vs dbl clicks
		this.element.click(this.click.bind(this));

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
	
	// Update element appearance based on whether it is selected or not
	set selected(TF) {
		this.updateSelection(TF);
	}
	updateSelection(TF) {
		this._selected = TF;
		if (TF) { // selected
			this.element.addClass("node_select");
			this.element.removeClass("node_unselect");
		} else {
			this.element.addClass("node_unselect");
			this.element.removeClass("node_select");
		}
	}

	// Getters
	get shownName() {
		return this._shownName
	}
	get selected() {
		return this._selected
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
		this.selected = false;
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
		
	}

}

class MealNode extends Node {
	// Define a subclass of node specific to meals
	constructor(shownName) {
		super(shownName, 'meal');
		this.element.addClass("word_text");

		this.inMenu = false; // store whether meal node is in the menu or not
		this.inResults = false; // store whether meal node is in a search
		
		// Allow node to be dragged and dropped
		this.element.attr("draggable", true)
		this.element.on("dragstart", function(event) {
			event.originalEvent.dataTransfer.setData("text", event.target.id);
		})
	}

	
	// setters
	set selected(TF) {
		this.updateSelection(TF)
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
	
	// getters
	get selected() {
		return this._selected
	}
	get inMenu() {
		return this._inMenu
	}
				
	// add meal to search results
	addToMealResults() {
		this.inResults = true;
		this.inMenu = false;

		$("#search_results").append(this.element);
		this.element.removeClass("meal_onMenu");
		this.element.addClass("meal_search");
	}

	// Add meal to menu
	addToMenu() {
		this.inResults = false;
		this.inMenu = true;
		this.selected = false;

		$("#menuField").append(this.element);
		this.element.removeClass("meal_search");
		this.element.addClass("meal_onMenu");
	}
	sendToLimbo() {
		this.inMenu = false;
		this.inResults = false;
		super.sendToLimbo()
		this.element.removeClass("meal_onMenu meal_search")
	}
	
	// Events
	doubleClick(event) {
		if (this.inMenu === false) { // Transfer to the menu
			this.addToMenu()
		} else { // Remove from menu; relaunch search in case meal is in results
			this.sendToLimbo()
			searchArea.launchSearch()
		}
	}
}



class IngrNode extends Node {
	// Define a subclass of node specific to ingrs
	constructor(shownName) {
		super(shownName, 'ingr');
		this.quantity = 0;

		this.element.addClass("word_text");
	}

	// Add ingr to grocery list
	addToGroceryList() {
		this.selected = false;

		$("#groceryField").append(this.element);
		this.element.addClass("ingr_onMenu");
	}

	//update innerHTML and dimensions (overwrite superclass method)
	updateElement() {
		if (this.quantity > 1) {
			// if multiple entries, bold and include x#
			this.element.html(this._shownName + "<b>" + " x" + this.quantity + "</b>");
		}
		else {
			this.element.html(this._shownName);
		}

		this.hrad = this.element.width() / 2;  //vertical radius
		this.vrad = this.element.height() / 2;  //horizontal radius
	}
	sendToLimbo() {
		super.sendToLimbo()
		this.element.removeClass("ingr_onMenu")
	}
}

class TagNode extends Node {
	// Define a subclass of node specific to tag
	constructor(shownName) {
		super(shownName, 'tag');
		this.element.addClass("word_text");
	}
}
