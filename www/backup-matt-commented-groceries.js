// Define websocket to be used for server interaction
var myWS = new WebSocket("ws://learnnation.org:8243/mySocket")

//////////////////////////////
////////////////////////////// Class Definitions
//////////////////////////////


// Define a node
function node(name, type) { // suggest Node (CapitalCase is conventional for class names)
	// Define an instance of a node
	// A node possesses various properties, as well as connections to other nodes
	// This node is meant to be a superclass
			
	///// Properties
	
	// Default Initializations
	this.name = '';
	this.shownName = '';
	this.hrad = 0;
	this.vrad = 0;
	this.connections = new Array();
	this.chosen = 0; //track whether this node is selected
	this.found = 0; // 1 if in current search results. 0 otherwise
	
	//set html element properties
	this.ID = document.createElement("div"); // Create an element to be displayed on the page // just wondering why we are calling this ID when in reality it is a DOM Element.  Are we using this as a unique identifier somehow?
	this.xstart = -500; //root location
	this.ystart = -500;
	this.xpos = -500;
	this.ypos = -500;
	
	// Declare node type
	this.type = type; // "meal", "ingredient", or "description"
	
	
	///// Methods
	
	//method to change name of item
	this.edit = function(newName) { //update true name
		this.name = name_trim(newName);
		this.shownName = newName; // here and below we are manually updating stuff as a reaction to changing the name.  We should instead have getters that calculate themselves based on the name when requested, mainly because it is simpler and less likely for us to make an error.
		this.ID.setAttribute("id", "ID_" + type + '_' + this.name);
		this.ID.setAttribute("onclick","choose('" + newName.toLowerCase() + "')");
		this.calcDim();
	}
	//update innerHTML and dimensions
	this.calcDim = function() {
		this.ID.innerHTML = this.shownName;
		this.hrad = this.ID.clientWidth / 2;  //vertical radius
		this.vrad = this.ID.clientHeight / 2;  //horizontal radius
	}
	
	// put node in limbo (hidden from view)
	this.sendToLimbo = function() {
		document.getElementById("limbo").appendChild(this.ID); // question: Hypothetically, let's say an element is already appended to some div in the webpage.  Then say we run appendChild to append the element elsewhere.  Will the element be removed from it's previous location?  or duplicated?
	}
	
	//updates object coordinates
	this.toStart = function() {
		this.xpos = this.xstart;
		this.ypos = this.ystart;
		this.draw();
	}
	//updates actual object location in window
	this.draw = function() {
		this.ID.style.left = this.xpos - this.hrad;
		this.ID.style.top = this.ypos - this.vrad;
	}

	// check connection
	this.isConnected = function(that) {
		if (this.connections.indexOf(that) == -1) { return false }
		else { return true }
	}
	// Add connections
	this.addConnections = function(nodeList) {
		// nodeList : list of nodes to add
		for (var i in nodeList) {
			if (this.isConnected(nodeList[i])) {
				// Add connection
				this.connections.push(nodeList[i]); // if we replace our connections array with a connections SET, then we don't need the if statement above.  Also, we never have to worry about adding something twice by accident
				nodeList[i].connections.push(this);
			}
		}
	}
	// Remove connections
	this.removeConnections = function(nodeList) {
		// nodeList : list of nodes to remove
		for (var i in nodeList) {
			if (this.isConnected(nodeList[i])) { // is connected, so remove connection
				// Remove connection in this node
				var index = this.connections.indexOf(nodeList[i])
				this.connections.splice(index, 1); // nice splice :)
				// Then remove connection in connected node
				var thisIndex = nodeList[i].connections.indexOf(this);
				nodeList[i].connections.splice(thisIndex, 1);
			}
		}
	}
	// for convenience, want to have a removeConnection method also?
	// Initialize several properties using methods
	this.edit(name);
	this.sendToLimbo();
}

// Define a subclass of node specific to meals
function meal_node(name) { // suggest Meal
	
	node.call(this, name, 'meal');
	this.ID.setAttribute("class", "meal_text word_text"); // suggest meal-text and word-text, because it's rare we can use dashes in variable names (so it definitely won't clash with other stuff, and when i see dashes i'll know right away it's a CSS class)
	
	///// Properties
	
	this.inMenu = 0;// store whether meal node is in the menu or not
	
	///// Methods
	
	// Add meal to menu
	this.addToMenu = function() { // question: is a menu essentially a meal list?
		this.inMenu = 1;
		this.chosen = 0;
		
		document.getElementById("menuField").appendChild(this.ID); // suggest menu-field
		this.ID.setAttribute("class","meal_onMenu_text word_text");
	}
	// add meal to search results
	this.addToMealResults = function() {
		this.inMenu = 0;
		
		document.getElementById("Results").appendChild(this.ID); // suggest results
		this.ID.setAttribute("class","meal_text word_text");
	}
	
}
meal_node.prototype = new node;

// Define a subclass of node specific to ingredients
function ingredient_node(name) {
	
	node.call(this, name, 'ingredient');
	this.ID.setAttribute("class", "ingr_text word_text");
	
	///// Methods
	
	// Add ingredient to grocery list
	this.addToGroceryList = function() { // question: is the grocery list essentially an ingredient list?
		this.chosen = 0;
		
		document.getElementById("groceryField").appendChild(this.ID);
		this.ID.setAttribute("class", "ingr_onMenu_text word_text");
	}
	
	//update shown name based on item quantity
	this.quantityChange = function(quan) { // this feels problematic because if somebody is viewing this ingredient and quantity, and then they SWITCH TO A DIFFERENT meal, which has this same ingredient, will the quantity still be this old quantity?  perhaps the quantity should be stored outside the ingredient, in the meal instead.  So the meal could hold something like [('asparagous', '5 grams'), ('carrots', '2 large'), ('broccoli', '1 head')] or similar.
		if (quan > 1) {this.shownName = "<b>" + this.name + " x" + quan + "</b>";} //name x3 // suggest using a CSS class name like "strong" instead of a bold tag.  This is for organization purposes: it's nice to keep styles in the CSS and content in the HTML.
		else {this.shownName = this.name;}
		this.calcDim();
	}
}
ingredient_node.prototype = new node;

// Define a subclass of node specific to descriptions
function description_node(name) { // what is a description?  I think I understand that menus are a list of meals and meals are a list of ingredients.  But what is a description used for?
	node.call(this, name, 'description');
	this.ID.setAttribute("class", "word_text");
}
description_node.prototype = new node;


//////////////////////////////
////////////////////////////// Functions
//////////////////////////////

////////////////////////////// Setup Function

// Called on page load to perform initial loading of data and node setup
function initialize() {

}


////////////////////////////// Node Functions
var mealNodes = new Array(); // List of all meal nodes // also see my comment on line 222 about creating a class called Graph.
var ingrNodes = new Array(); // List of all ingredient nodes // may be redundant, if we know the meals and can access the ingr through the meals.  Do you want ingredients to appear even if they are not present in any meal?
var descNodes = new Array(); // List of all description nodes

// [ACTION: Add Meal Button] Add a new meal node
function addMeal() {
	// On press of the add meal button, read the contents of the text box for the new meal and add 
	// it to the meal nodes
	var mealName = document.getElementById("mealBox").value;
	// First check it is valid
	var mealNameTrim = name_trim(mealName); // is this trimming function specific to meals?  If it's general and could be used in other ways, then we can just call it "trim" or "strip".  Also, if this function is always used when grabbing user inputs, we might even make a shortcut function like:
// function trim_input(id) {
//	return trim(document.getElementById(id).value)
// }
	if (mealNameTrim.length == 0) {return} // nothing there // in JS, using === is good habit, since it is a direct comparison.  == tries to be "smart" but as a result it just very unpredictable.  For example, is "" == 0 ?  Who knows!  Is "" === 0 ?  No. // Also, why not write if(mealNameTrim === "")
	
	// Create meal node
	mealNode = new meal_node(mealName);
	// Add to list
	mealNodes.push(mealNode);
}
	
	
// Remove a recipe
function removeRecipe(mealNode) { // is "recipe" synonymous with "meal"?  suggest choosing one
	// mealNode : node object of meal to be deleted
	
	// Grab list of currently connected nodes
	var mealConnections = mealNode.connections;
	
	// Remove all connections
	mealNode.removeConnections(mealConnections);
	
	// Delete meal
	var index = mealNodes.indexOf(mealNode);
	mealNodes.splice(index, 1);
	
	// Cycle through it connections, deleting them if they no longer have any connections
	for (var i in mealConnections) { // this is nice, but consider this...  What if we had a class called Graph (or some cooler name) that held all the nodes?  And that graph class had a generic removeNode function?  It would basically be the same as removeRecipe, but more general.
		if (mealConnections[i].connections.length == 0) {
			// Delete it
			if (mealConnections[i].type == 'ingredient') {
				index = ingrNodes.indexOf(mealConnection[i]);
				ingrNodes.splice(index, 1);
			}
			else {
				index = descNodes.indexOf(mealConnection[i]);
				descNodes.splice(index, 1);
			}
		}
	}
}

////////////////////////////// Helper Functions

// Given a node name, ensure it follows various rules
function name_trim(name) {
	// name : a string
	// return the processed name, replacing spaces with '_'. Also make it all lowercase. Remove any special characters as well
	
	name = name.toLowerCase(); // make lowercase
	name = name.trim(); // remove spaces from the ends
	name = name.replace(/\s+/g, '_'); // Replace spaces with underscores // necessary?  what is purpose?
	name = name.replace(/\W/g, ''); // remove anything but letters, numbers, and _
	
	return name
}
// Return list of all node names
function getNodeStrings(nodeList) { // if a Graph class gets adopted, this function would move into Graph
	// nodeList : any array of node objects
	var nodeStrings = new Array();
	for (var i in nodeList) {
		nodeStrings[i] = nodeList[i].name;
	}
	return nodeStrings
}





/////////////////////////////////////////////////////Function to add more Items/////////////////////////////////////////////////////

var itemList = new Array(); //itemList[i] is the pointer to the ith item object (itemObject)
var itemListStrings = new Array(); //parallel array of itemList for easier searching

 //removes extra \n and extra spaces between items, from input and returns shortened string
function removeExtra(stringInput) {
	stringInput=stringInput.replace(/\n/g,""); //remove all "new line"s
	stringInput=stringInput.replace(/, +/g,","); //remove all spaces after commas
	return stringInput
}
 //Input processing: called by submitting items
function readItem(addOrEdit) {//add(0) or edit(1) an item
	//Read items and process strings

	var item1Value=document.getElementById("item1").value; //meal
	var item2Value=document.getElementById("item2").value; //ingredients
	var item3Value=document.getElementById("item3").value; //descriptions
	
	if (item1Value!='' ||item2Value!='') { //if they aren't both empty
		document.getElementById("item1").value='';
		document.getElementById("item2").value='';
		document.getElementById("item3").value='';
		item1Value=removeExtra(item1Value.trim());
		item2Value=removeExtra(item2Value.trim());
		item3Value=removeExtra(item3Value.trim());

		item1Value=item1Value.split(","); //convert to arrays
		item2Value=item2Value.split(",");
		item3Value=item3Value.split(",");

		//pass arrays to addItem or editItem
		if (addOrEdit==0) {
			addItem(item1Value,item2Value,item3Value);
		}
		else {
			editItem(item1Value,item2Value,item3Value);
		}
	}
	
	saveData();
	launchSearch();
	showMenu();
		
}
 //takes in an array representing the item1's and an array for item2's
function addItem(item1Value,item2Value,item3Value) { // is "item" synonymous with "ingredient"

	var item1Objects=new Array();
	var item2Objects=new Array();
	var item3Objects=new Array(); //pointers of all entered items
	for (var i in item1Value) { //loop through item1 strings
		var itemIndex=itemListStrings.indexOf(item1Value[i].toLowerCase()); //find in existing items
		if (itemIndex==-1 && item1Value[i]!="") { //if nonexistent, create and add to existing items
			var newItem=new itemObject(item1Value[i],1) // create new meal item
			itemList.push(newItem);
			itemListStrings.push(item1Value[i].toLowerCase());
			item1Objects.push(newItem); //add to list of entered item pointers
		}
		else if (item1Value[i]!="") {
			item1Objects.push(itemList[itemIndex]);
		}
	}
	for (var i in item2Value) { //loop through item2 strings
		var itemIndex=itemListStrings.indexOf(item2Value[i].toLowerCase()); //find in existing items
		if (itemIndex==-1 && item2Value[i]!="") { //if nonexistent, create and add to existing items
			var newItem=new itemObject(item2Value[i],2) //create new ingredient item
			itemList.push(newItem);
			itemListStrings.push(item2Value[i].toLowerCase());
			item2Objects.push(newItem); //add to list of entered item pointers
		}
		else if (item2Value[i]!="") {
			item2Objects.push(itemList[itemIndex]);
		}
	}
	for (var i in item3Value) { //loop through item3 strings
		var itemIndex=itemListStrings.indexOf(item3Value[i].toLowerCase()); //find in existing items
		if (itemIndex==-1 && item3Value[i]!="") { //if nonexistent, create and add to existing items
			var newItem=new itemObject(item3Value[i],3) //create new description item
			itemList.push(newItem);
			itemListStrings.push(item3Value[i].toLowerCase());
			//purposefully still adding to item2Objects
			item2Objects.push(newItem); //add to list of entered item pointers
		}
		else if (item3Value[i]!="") {
			item2Objects.push(itemList[itemIndex]);	//purposefully still adding to item2Objects
		}
	}

	// add connections
	for (var i in item1Objects) {
		for (var j in item2Objects) {
			if (item1Objects[i].connections.indexOf(item2Objects[j])==-1) {
				item1Objects[i].connections.push(item2Objects[j]);
				item2Objects[j].connections.push(item1Objects[i]);
			}
		}
	}
}
//if editing instead of adding a new item. If >1 item 1's entered, then edit the first and add others
function editItem(item1Value,item2Value,item3Value) {
	var item1Objects=new Array();
	var item2Objects=new Array();
	var item3Objects=new Array(); //pointers of all entered items
	
	// if editType is 2, flip the first two inputs (yes this is a confusing way to do it)
	if (editType==2) {
		var tempSwitch=item1Value;
		item1Value=item2Value;
		item2Value=tempSwitch;
	}
	
	//check if the new item name already exists:
	if (itemListStrings.indexOf(item1Value[0].toLowerCase())!=editing && itemListStrings.indexOf(item1Value[0].toLowerCase())!=-1) {
		alert("This name is already in use.\nEither edit that one or use something else :P")
	}
	else {
		//update the new name, everywhere it appears
		itemList[editing].edit(item1Value[0]);
		itemListStrings[editing]=item1Value[0].toLowerCase();

		//now go through entries and find pointers for all items entered, adding new ones if necessary
		for (var i in item1Value) { //loop through item1 strings
			var itemIndex=itemListStrings.indexOf(item1Value[i].toLowerCase()); //find in existing items
			if (itemIndex==-1) { //if nonexistent, create and add to existing items
				var newItem=new itemObject(item1Value[i],editType) //if editing a menu item, item1 refers to menu items (and vice versa)
				itemList.push(newItem);
				itemListStrings.push(item1Value[i].toLowerCase());
				item1Objects.push(newItem); //add to list of entered item pointers
			}
			else {
				item1Objects.push(itemList[itemIndex]);
			}
		}
		for (var i in item2Value) { //loop through item2 strings
			var itemIndex=itemListStrings.indexOf(item2Value[i].toLowerCase()); //find in existing items
			if (itemIndex==-1) { //if nonexistent, create and add to existing items
				var newItem=new itemObject(item2Value[i],3-editType) //if editing a menu item, item2 is ingredients (and vice versa)
				itemList.push(newItem);
				itemListStrings.push(item2Value[i].toLowerCase());
				item2Objects.push(newItem); //add to list of entered item pointers
			}
			else {
				item2Objects.push(itemList[itemIndex]);
			}
		}
		for (var i in item3Value) { //loop through item3 strings
			var itemIndex=itemListStrings.indexOf(item3Value[i].toLowerCase()); //find in existing items
			if (itemIndex==-1) { //if nonexistent, create and add to existing items
				var newItem=new itemObject(item3Value[i],3)
				itemList.push(newItem);
				itemListStrings.push(item3Value[i].toLowerCase());
				//add objects to ingredients
				if (editType==1) {item2Objects.push(newItem);} //add to list of entered item pointers
				else if (editType==2) {item1Objects.push(newItem);}
			}
			else {
				if (editType==1) {item2Objects.push(itemList[itemIndex]);}
				else if (editType==2) {item1Objects.push(itemList[itemIndex]);}
			}
		}

		//first sever all connections for editing item (item1Objects[0], or itemList[editing])
		var removals=new Array;//mark any items left compeltely disconnected
		for (var j in itemList[editing].connections) {//disconnected with each connection before deletion
			itemList[editing].connections[j].connections.splice(itemList[editing].connections[j].connections.indexOf(itemList[editing]),1);
			if (itemList[editing].connections[j].connections.length==0) {removals.push(itemList[editing].connections[j]);}
		}

		itemList[editing].connections=new Array();

		// add connections
		for (var i in item1Objects) {
			for (var j in item2Objects) {
				if (item1Objects[i].connections.indexOf(item2Objects[j])==-1) {
					item1Objects[i].connections.push(item2Objects[j]);
					item2Objects[j].connections.push(item1Objects[i]);
				}
			}
		}

		choose(-2);
		//check again if they are still disconnected, and remove if so
		for (var i in removals) {//disconnected with each connection before deletion
			if (removals[i].connections.length==0) {removals[i].chosen=1;}
		}
		deleteItems(0);
	}
}


///////////////////////////////////////////////////////Choose and Edit Items//////////////////////////////////////////////////////

//process when user chooses to edit item(s)
var editing=-1;
var editType=0;
function choose(wch) {
	//if things are being deselected, clear item Entry
	if (editing!=-1) {document.getElementById("item1").value='';
		document.getElementById("item2").value='';
		document.getElementById("item3").value='';}
	
	editing=-1;
	document.getElementById("editButton").disabled=true;
	document.getElementById("submitButton").disabled=false;
	
	if(wch==-2) { //unselect all items
		for (var i in itemList) {
			itemList[i].chosen=0;
			itemList[i].ID.style.opacity=1;
		}
	}
	else if (itemList[itemListStrings.indexOf(wch)].chosen==0) { //select
		editing=itemListStrings.indexOf(wch);
		editType=itemList[editing].type; //record which type (meal or ingredient)
		itemList[editing].chosen=1;
		itemList[editing].ID.style.opacity=.5;
		document.getElementById("editButton").disabled=false;
		document.getElementById("submitButton").disabled=true;
		if (editType==1) { //if editing a meal
			document.getElementById("item1").value=itemList[editing].name;
			var connectionNames=new Array(); //for ingredients
			var connectionNames2=new Array(); //for descriptions
			for (var i in itemList[editing].connections) {
				if (itemList[editing].connections[i].type==2) {connectionNames.push(itemList[editing].connections[i].name);}
				if (itemList[editing].connections[i].type==3) {connectionNames2.push(itemList[editing].connections[i].name);}
			}
			document.getElementById("item2").value=connectionNames.join(", ");
			document.getElementById("item3").value=connectionNames2.join(", ");
		}
		else if (editType==2) { //if editing an ingredient
			document.getElementById("item2").value=itemList[editing].name;
			var connectionNames=new Array();
			for (var i in itemList[editing].connections) {
				connectionNames[i]=itemList[editing].connections[i].name;
			}
			document.getElementById("item1").value=connectionNames.join(", ");		
		}
	}
	else { //deselect
		itemList[itemListStrings.indexOf(wch)].chosen=0;
		itemList[itemListStrings.indexOf(wch)].ID.style.opacity=1;
	}
	
	//make sure the correct buttons are shown
	transferButtons();
}

// delete selected items
function deleteItems(overRide) {
	if (overRide==1) {
		for (var i in itemList) { //delete all items
			oldObjId=itemList[i].ID;
			if (itemList[i].type==1 && itemList[i].inMenu==0) {document.getElementById("Results").removeChild(oldObjId);}
			else if (itemList[i].type==1 && itemList[i].inMenu==1) {document.getElementById("mealField").removeChild(oldObjId);}
			else if (itemList[i].type==2) {document.getElementById("groceryField").removeChild(oldObjId);}
		}
		itemList=new Array();
		itemListStrings=new Array();
	}
	else {
		for (var i=itemList.length-1;i>=0;i--) { //start at end so stored indices don't change
			if(itemList[i].chosen==1) {
				oldObjId=itemList[i].ID;
				//delete from appropriate location
				if (itemList[i].type==1 && itemList[i].inMenu==0) {document.getElementById("Results").removeChild(oldObjId);}
				else if (itemList[i].type==1 && itemList[i].inMenu==1) {document.getElementById("mealField").removeChild(oldObjId);}
				else if (itemList[i].type==2) {document.getElementById("groceryField").removeChild(oldObjId);}
		

				for (var j in itemList[i].connections) {//disconnected with each connection before deletion
					itemList[i].connections[j].connections.splice(itemList[i].connections[j].connections.indexOf(itemList[i]),1);
				}
				itemList.splice(i,1);//removes indicated element/object from list of existing items
				itemListStrings.splice(i,1);//removes indicated element/object from list of existing item strings
			}
		}
		choose(-2);
		document.getElementById("item1").value='';
		document.getElementById("item2").value='';
		document.getElementById("item3").value='';
		showMenu();
		launchSearch();
		saveData();
	}
}

///////////////////////// Function to search and display items based on searched items /////////////////////////

var foundItemList=new Array();
function launchSearch() { // begin ingredient(0) or meal(1) search
	
	foundItemList=new Array();
	for (var i in itemList){ //reset all items to not found
		itemList[i].found=0;
	}
	if (currentTab==0) {foundItemList=ingrSearchFunc();}
	else if (currentTab==2) {foundItemList=mealSearch();}
	
	positionResults(foundItemList,1); //calculate positions based on search
	transferButtons();
}

//search given item list (iList) for given specifications (type and spec)
function itemSearch(iList,type,spec,posneg) {
	var newList=new Array();
	for (var i in iList) {
		var flag=true;
		//if this item is of the wrong type, fail
		if (iList[i].type!=type ||iList[i].inMenu==1) {flag=false;}
		//if there is a spec, it's positive, and this item isn't connected to the spec, fail
		if (spec!=-1 && posneg==1 && iList[i].connections.indexOf(spec)==-1) {flag=false}
		//if there is a spec, it's negative, and this item is connected to the spec, fail
		else if (spec!=-1 && posneg==-1 && iList[i].connections.indexOf(spec)!=-1) {flag=false;}
		
		//if none of the above were failed, keep this item
		if (flag) {newList.push(iList[i]);}
	}
	return newList
}

//ingredient search
function ingrSearchFunc() {
	
	var searchedItems
	searchedItems=document.getElementById("ingredientSearch").value;
	
	var foundIngrList=new Array(); //list of found items
	numberFound=0; //number of items found so far

	 //if search query is "all", show all
	if (searchedItems.replace(/\s/g,"")!="") {
		if(searchedItems.toLowerCase()=="all") {
			foundIngrList=itemSearch(itemList,1,-1,1);
			numberFound=foundIngrList.length;
		}
		else {//convert to search query
			//get rid of trailing AND or OR if there is nothing after:
			var searchQuery=searchedItems.replace(/(a|an|and|o|or)\s*$/ig,"");
			//replace AND, &&&&&& and OR, |||||||with && and ||
			searchQuery=searchQuery.replace(/\band\b|&{2,}/ig,"&&");
			searchQuery=searchQuery.replace(/\bor\b|\|{2,}/ig,"||");
			//replace && ||||with &&, etc
			searchQuery=searchQuery.replace(/&&(\s*(&&|\|\|))+/ig,"&&");
			searchQuery=searchQuery.replace(/\|\|(\s*(&&|\|\|))+/ig,"||");
			//replace searchQuery with function to check if it is connected to a given item
			searchQuery=searchQuery.replace(/(^|\&&|\|\||\()((?:[^(](?!$|\)|&&|\|\|))*.(?=$|\)|&&|\|\|))/g,"$1isConnected(\"$2\",temp)");

			//cycle through all items and compare to search criteria
			var possMealList=itemSearch(itemList,1,-1,1);
			for (var i in possMealList) {
				temp=possMealList[i]; //required for searchQuery
				if (eval(searchQuery) && possMealList[i].type==1) { //if it meets search criteria and it is a menu item
					possMealList[i].found=1;
					numberFound=foundIngrList.push(possMealList[i]);
				}
			}
		}
	}
	return foundIngrList
}
// is searchWord connected to item (returns true or false)
function isConnected(searchWord,item) {
	searchWord=searchWord.trim();
	searchWord=searchWord.toLowerCase();
	if(itemListStrings.indexOf(searchWord)==-1) {return false} //check if the searchWord is even an item
	var searchWordItem=itemList[itemListStrings.indexOf(searchWord)]; //find pointer of searchWord
	
	connectedItemList=new Array();
	for (var i in item.connections) { //search all connections
		connectedItemList.push(item.connections[i]);
	}
	if (connectedItemList.indexOf(searchWordItem)==-1) {return false}
	else {return true}
}

//meal lookup
function mealSearch() {
	var searchItem=removeExtra(document.getElementById("mealLookup").value);
	var foundMealList=new Array(); //list of found items
	numberFound=0; //number of items found so far
	
	if (searchItem.replace(/\s/g,"")!="") { //only proceed if it is not empty
		if (searchItem.toLowerCase()=="all") { //if they type all, show all meals
			foundMealList=itemSearch(itemList,1,-1,1);
			numberFound=foundMealList.length;
		}
		else {
			var mealList=itemSearch(itemList,1,-1,1);//get list of meals
				
			var regex=new RegExp(searchItem,"i")
			for (var i in mealList) {
				if (regex.test(mealList[i].name)) {
					mealList[i].found=1;
					numberFound=foundMealList.push(mealList[i]);
				}
			}
		}
	}
	return foundMealList
}

//random menu generator
function generate() {
	genNumber=document.getElementById("mealNumValue").value;
	if (genNumber=='') { //if empty, make the value 7
		genNumber=7;
		document.getElementById("mealNumValue").value=genNumber;
	}
	// parse specifications:
	var specText=document.getElementById("mealConditions").value;
	specText+=',0 side';
	specText=specText.replace(/\n/g,","); //change "new line" to ","
	specText=specText.replace(/,\s+|\s+,/g,","); //remove space after and before commas
	specText=specText.replace(/^\s+|\s+$/g,"");//remove space at the beginning and end
	specText=specText.replace(/^\s*,|,\s*$/g,"");//remove empty spots at beginning or end
	specText=specText.replace(/,\s*,/g,",");//remove empty spots in the middle
	
	var rawSpecList=specText.split(",");//parse into individual specs
	var specList=new Array;//specList[i]=[min,max,ingredient,Number added to final menu]
	var form1=/(\d+)\s*\/\s*(\d+)\s+(.+)/;
	var form2=/(\d+)\s+(.+)/;
	for (var i in rawSpecList) { //parse individual specs into min/max/ingredient
		//if "#1/#2 ingredient" is given, assume min#1, max=#2
		if (form1.test(rawSpecList[i])){
			specList.push([eval(RegExp.$1),eval(RegExp.$2),RegExp.$3,0])
		}
		//if "# ingredient" is given, assume min=max=#
		else if (form2.test(rawSpecList[i])){
			specList.push([eval(RegExp.$1),eval(RegExp.$1),RegExp.$2,0])
		}
		//if "ingredient" is given, assume min 1, max equal to genNumber
		else {
			specList.push([1,genNumber,rawSpecList[i],0])
		}
	}
	
	for (var i in specList) { //first go through and replace all ingredients with their pointer
		//if min>max, switch
		if (specList[i][0]>specList[i][1]){var temp=specList[i][1];
			specList[i][1]=specList[i][0];specList[i][0]=temp;}
			
		if (itemListStrings.indexOf(specList[i][2])!=-1) {
			var itemKey=itemList[itemListStrings.indexOf(specList[i][2])]; //store pointer
			if (itemKey.type>=2) {specList[i][2]=itemKey;} //if an ingredient/description
			else {specList.splice(i,1)} //otherwise, remove
		}
		else {specList.splice(i,1)} //otherwise, remove
	}
	
	var possibleMenuItems=itemSearch(itemList,1,-1,1); //all meal items
	possibleMenuItems=removeMaxes(possibleMenuItems,specList); //remove any 0 max specs
	foundItemList=new Array();
	var finalMenuSize=0;
	
	//first round through to meet all minima
	for (var i in specList) {
		
		//find all menu options that contain this ingredient
		var mealOptions=itemSearch(possibleMenuItems,1,specList[i][2],1);
		//if we need more menu items, there are still possibilities, the min>0, and this is an actual item
		while (mealOptions.length>0 && finalMenuSize<genNumber && specList[i][0]>specList[i][3]) {
			
			//add a random option
			var addedMeal=mealOptions[Math.floor(Math.random()*mealOptions.length)];
			finalMenuSize=foundItemList.push(addedMeal);
			addedMeal.found=1;
			
			//update progress on each spec and remove added meal and any menu items that would exceed any spec maxes
			specList=tallyIngredients(addedMeal,specList);
			possibleMenuItems=removeMeal(possibleMenuItems,addedMeal);
			possibleMenuItems=removeMaxes(possibleMenuItems,specList);
			
			//find all menu options that contain this ingredient
			mealOptions=itemSearch(possibleMenuItems,1,specList[i][2],1);
		}
	}
	
	//second round, pick randomly from all options while options remain and more menu items are required
	while (possibleMenuItems.length>0 && finalMenuSize<genNumber) {
		//add a random option
		var addedMeal=possibleMenuItems[Math.floor(Math.random()*possibleMenuItems.length)];
		finalMenuSize=foundItemList.push(addedMeal);
		addedMeal.found=1;
		
		//update progress on each spec and remove added meal and any menu items that would exceed any spec maxes
		specList=tallyIngredients(addedMeal,specList);
		possibleMenuItems=removeMeal(possibleMenuItems,addedMeal);
		possibleMenuItems=removeMaxes(possibleMenuItems,specList);

	}
	
	positionResults(foundItemList,1); 
}

//////Subfunctions functions//////
//returns updated specList. adds tally to appropriate ingredient quantities based on newly added menu item
function tallyIngredients(addedMeal,specList) {
	for (var i in specList) {
		if (addedMeal.connections.indexOf(specList[i][2])!=-1) {specList[i][3]++}		
	}
	return specList
}
//returns new possibleMenuItems with the added Meal removed
function removeMeal(possibleMenuItems,addedMeal) {
	mealIndex=possibleMenuItems.indexOf(addedMeal);
	possibleMenuItems.splice(mealIndex,1);
	return possibleMenuItems
}
//given list of currently allowed menu items, remove any meal with a maxed out ingredient, then return new list
function removeMaxes(possibleMenuItems,specList) {
	for (var i in specList) {
		if (specList[i][3]>=specList[i][1]) { //if any ingredient is at its max, remove it
			possibleMenuItems=itemSearch(possibleMenuItems,1,specList[i][2],-1);
		}
	}
	return possibleMenuItems
}


//Calculate position of items in results block given list of items and which results section
function positionResults(itemDisplay,section) {
	//DRAWING
	//reset all objects first to offscreen
	for (var i in itemList) {
		var flag=false; //check if this section applies to this item. if so, reset
		if (section==1 && itemList[i].type==1 && itemList[i].inMenu==0) {flag=true;}
		else if (section==2 && itemList[i].type==1 && itemList[i].inMenu==1) {flag=true;}
		else if (section==3 && itemList[i].type==2) {flag=true;}
		
		if (flag) {
			itemList[i].xstart=-500;
			itemList[i].ystart=-500;
		}
	}
	//update start position of all found objects
	var curTop=0;
	var curLeft=0;
	var maxRight=0;
	if (section==1) { //menu item search area
		var bottom=document.getElementById("Results").clientHeight;}
	else if (section==2) { //showing ingredients from given menu items
		var bottom=document.getElementById("mealField").clientHeight;}
	else if (section==3) { //showing ingredients from given menu items
		var bottom=document.getElementById("groceryField").clientHeight;}	
	
	for (var i in itemDisplay) {
		itemVrad=itemDisplay[i].vrad;
		itemHrad=itemDisplay[i].hrad;
		if (curTop+2*itemVrad>bottom) {curTop=0;
			curLeft=maxRight+5;
		}
		itemDisplay[i].xstart=curLeft+itemHrad;
		itemDisplay[i].ystart=curTop+itemVrad;
		if (curLeft+2*itemHrad>maxRight) {
			maxRight=curLeft+2*itemHrad;
		}
		curTop+=2*itemVrad;
	}
	
	for (var i in itemList){ //if item is removed from search, chosen=0
		itemList[i].chosen*=itemList[i].found;
		itemList[i].ID.style.opacity=1-itemList[i].chosen*.5;
	}
	//if an item is removed from view or for some reason unchosen, reset editing conditions
	if (editing!=-1 && itemList[editing].chosen==0) {
		editing=-1;
		document.getElementById("editButton").disabled=true;
		document.getElementById("submitButton").disabled=false;
		document.getElementById("item1").value='';
		document.getElementById("item2").value='';
		document.getElementById("item3").value='';
	}
	drawAll();//update positions
}
//Update all item locations
function drawAll() {
	for (var i in itemList) {
		itemList[i].toStart();
	}
}

///////Show Chosen Menu Items and Grocery List///////

var menuList=new Array(); //array of chosen menu items
//transfer meals to or from chosen Menu
function transferMeal(dir) {
	if (dir==2) {
		for (var i in foundItemList) {
			foundItemList[i].switchFields(1);
		}
	}
	else if (dir==1) {//add selected meals to menu
		for (var i in foundItemList) {
			if (foundItemList[i].chosen==1) {
				foundItemList[i].switchFields(1);
			}
		}
	}
	else if (dir==-1) { //remove item from menu
		for (var i=menuList.length-1;i>=0;i--) { //go through in reverse to avoid index changes
			if (menuList[i].chosen==1) {
				menuList[i].switchFields(2);
			}
		}
	}
	else if (dir==-2) {//clear all menu items
		for (var i in menuList) {
			menuList[i].switchFields(2);
		}
	}
	showMenu();
	launchSearch();	
}
//handle which buttons are shown based on what is selected
function transferButtons() {
	var flag1=false; //check to see if any menu items are selected (if yes, show add button)
	var flag2=false; //check to see if any menu items (if yes, show "add all" button)
	for (var i in foundItemList) {flag2=true; //If there are any found
		if (foundItemList[i].chosen==1) {flag1=true;}}
	if (flag1) {document.getElementById("addMeal").style.display="inline-block";}
	else {document.getElementById("addMeal").style.display="none";}
	if (flag2) {document.getElementById("addAllMeals").style.display="inline-block";}
	else {document.getElementById("addAllMeals").style.display="none";}
	
	
	var flag=false; //check to see if any menu items are selected (if yes, show remove button)
	for (var i in menuList) {if (menuList[i].chosen==1) {flag=true;}}
	if (flag) {document.getElementById("removeMeal").style.display="inline-block";}
	else {document.getElementById("removeMeal").style.display="none";}
	//if there are any menu items, show clear all
	if (menuList.length>0) {document.getElementById("clearMeals").style.display="inline-block";}
	else {document.getElementById("clearMeals").style.display="none";}

}
function showMenu() {
	menuList=new Array();
	for (var i in itemList) {
		if (itemList[i].inMenu==1) {menuList.push(itemList[i]);}
	}
	showGroceryList(menuList);
	transferButtons();	
	positionResults(menuList,2); //draw it all
}

function showGroceryList(currentMenu) {
	var groceryList=new Array;//collection of all groceries
	var groceryListQuantity=new Array;//holds number of meals this item is for
	
	for (var i in currentMenu) {
		for (var j in currentMenu[i].connections) {
			var iIndex=groceryList.indexOf(currentMenu[i].connections[j]);
			if (iIndex==-1 && currentMenu[i].connections[j].type==2) { //if this item is not on our list yet, and is an ingredient, add it:
				groceryList.push(currentMenu[i].connections[j]);
				groceryListQuantity.push(1);
			}
			else if (currentMenu[i].connections[j].type==2) {groceryListQuantity[iIndex]++;} //else, tally up that ingredient
		}
	}
	for (var i in groceryList) { //update each ingredient to have x# after it (if applicable)
		groceryList[i].quantityChange(groceryListQuantity[i]);
	}
	
	positionResults(groceryList,3); //draw it all
}

////////////////////////////////////////////////Save all Data////////////////////////////////////////////////
//store data in cookie by combining into string
var savedHistory=[]; //hold history of changes to allow "Undo"
function saveData() {
	var itemStore='';
	for (var i in itemList) {
		if (itemList[i].type==1) {//only store if this is a menu item (assume no lone ingredients)
			if(itemStore!='') {
				itemStore+="|||";
			}
			itemStore+=itemList[i].name;
			itemStore+="||";
			for (var j in itemList[i].connections) {
				if (j>0) {itemStore+="|";}
				itemStore+=itemList[i].connections[j].type+''+itemList[i].connections[j].name; //add type immediately followed by the name
			}
		}
	}
	
	if (savedHistory[placeInHistory]!=itemStore) {
		if (placeInHistory>0) {savedHistory.splice(0,placeInHistory);
			placeInHistory=0;
			document.getElementById("redoButton").disabled=true;}
		savedHistory.splice(0,0,itemStore);
		if (savedHistory.length>20) {savedHistory.splice(20,1);}
		else if (savedHistory.length==2) {document.getElementById("undoButton").disabled=false;}
	}

	setCookie("itemStore",itemStore)
}
//make string representing saved data
var dataString
function printSaveData() {
	var itemStore='';
	for (var i in itemList) {
		if (itemList[i].type==1) {//only store if this is a menu item (assume no lone ingredients)
			if(itemStore!='') {
				itemStore+="|||";
			}
			itemStore+=itemList[i].name;
			itemStore+="||";
			for (var j in itemList[i].connections) {
				if (j>0) {itemStore+="|";}
				itemStore+=itemList[i].connections[j].type+''+itemList[i].connections[j].name; //add type immediately followed by the name
			}
		}
	}
	dataString=itemStore;

	document.getElementById("saveOrLoadRecord").value=dataString;
}

/////////////////////////////////////////////Access, load, & set cookies and variables////////////////////////////////////////////
var ctrl=0;
var curVersion=10; //current version of stored data
//load cookie data or default values if no cookies
function loadData() {
	//Check if there are any cookies first
	var systemRead=getCookie("itemStore");
	if(getCookie("mstr")=='1'){ctrl=1;}
	// determine version
	var version
	if (getCookie("vers")==''){version=0;}
	else {version=eval(getCookie("vers"));}
	
	if (ctrl!=1 && version<curVersion) {
                systemRead="stir fry||2peppers|2cashews|2onions|2garlic|2ginger|2rice|2chicken|2soy sauce|2rice vinegar|2peanut oil|2broccoli|2spinach|||chorizo pasta||2chorizo|2pasta|2cherry tomatoes|2spinach|||tacos||2beef|2cheese|2cilantro|2red onion|2tomatoes|2salsa|2tortillas|2spanish rice|2avocado|2taco seasoning|3easy|||chili||2ground beef|2kidney beans|2black beans|2onions|2peppers|2celery|2tomato sauce|2cumin|2chile powder|2cayenne|2garlic|2bay leaves|3crock pot|||rice and beans||2rice|2black beans|2avocado|2onion|2garlic|3easyvegetarian|||fish||2marinade|2tilapia|2rice|2vegetable|||lentils||2red lentils|2spinach|2diced tomatos (15oz)|2onions|2garlic|2ginger|2chicken broth|2curry|2mustard seeds|2coriander|2cumin|2cayenne pepper|2sugar|2salt|2lemon juice|2cilantro|3vegetarian|||moroccan chicken||2chicken|2apricots|2raisins|2chicken broth|2tomato paste|2flour|2lemon juice|2garlic|2cumin|2ginger|2cinnamon|3crock pot|||meatballs||2pork|2beef|2pasta|2bread crumbs|2eggs|2tomato sauce|3crock pot|||chicken and cous cous||2cous cous|2chicken|2cinnamon|2garlic|2ginger|2raisins|2almonds|2carrots|2yogurt|||tandoori chicken||2chicken|2garam masala|2yogurt|2flatbread|2rice|2vegetables|2hummus|3grill|||chick peas and kale curry||2chick peas|2coconut milk|2kale|2curry|2cashews|2onions|2garlic|3vegetarian|||fried rice||2rice|2eggs|2peas|2broccoli|2carrots|2onions|2meat|2corn|2fried rice seasoning|2soy sauce|2hoisin sauce|||schnitzel||2beef|2pork|2flour|2eggs|2bread crumbs|2mushrooms|2gravy|2vegetables|2potatoes|2peas|||pulled pork||2pork roast|2coca cola|2barbecue sauce|2rolls|||cucumber salad||2cucumbers|2dill|2olive oil|2red wine vinegar|2salt|3side|||quiche||2bisquick|2eggs|2spinach|2milk|2gouda cheese|2broccoli|3vegetarian|||beer can chicken||2chicken|2beer can|2orange|2tarragon|||beef stroganoff||2beef|2egg noodles|2red wine|2mushrooms|2sour cream|2onions|2garlic|2tarragon|2black pepper|||crock pot burritos||2meat|2onions|2peppers|2cheese|2tortillas|2rice|2guacamole|2crushed tomatoes|3crock pot|||shrimp harissa||2shrimp|2pasta|2mint|2cilantro|2lemon juice|2jalapenos|2garlic|2cumin|2ground fennel|2feta cheese|2walnuts|||meatloaf||2ground beef|2onion|2parmesan|2ketchup|2eggs|2bread|2breadcrumbs|2parsley|2Worcester sauce|2potatoes|||chicken wings||2wings of chicken|2vegetable|2butter|2hot sauce|2barbecue sauce|3grill|||cornbread||2Albers cornmeal|2flour|2sugar|2baking powder|2salt|2milk|2vegetable oil|2eggs|||macaroni casserole||2macaroni pasta|2Kraft mac n cheese|2broccoli|2bread crumbs|2eggs|2cheese|2milk|2sausage|||grilled stuff||2hamburger|2brots|2cheese|2buns|2toppings|2corn on the cob|3grill|||grilled steak||2steak|3grill|||chicken pot pie||2chicken|2sausage|2potatoes|2peas|2carrots|2butter|2flour|2milk|2onions|2thyme|2tarragon|||Enchiladas||2black beans|2onion|2enchilada sauce|2peppers|2anaheim pepper|2corn|2soy chorizo|2spanish rice|2mexican cheese|2taco mix|2tortillas|3vegetarian|||Lasagna||2Lasagna pasta|2pasta sauce|2ricotta|2eggs|2mozzarella|2sausage|2spinach|||Eggplant Parmesan||2Eggplant|2eggs|2pasta sauce|2bread crumbs|2shredded cheese|||Vegetable curry||2Sweet potatoes|2potatoes|2cauliflower|2chickpeas|2carrots|2onion|2garlic|2curry powder|2coconut milk|2peas|2rice|||Sesame chicken||2Chicken thighs|2soy sauce|2sesame seeds|2white wine|2garlic|2onion|2brown sugar|2ginger|2rice|2broccoli|||Potato Enchiladas||2onion|2potatoes|2scallions|2tortillas|2cilantro|2mexican string cheese|2mexican cheese|2enchilada sauce|2chipotle in adobo|||Tortellini||2sun dried tomatoes|2asparagus|2butter|2olive oil|2pesto pasta|||Generall||2Apples|2milk|2lunchmeat|2yogurt|2cream cheese|2chips|2salsa|2juices|||Steak tacos||2Steak|2tortillas|2spanish rice|2red onion|2tomato|2avocados|2cilantro|2rub|2hard shell taco|||TJs||2Granola|2OJ|2PBP|2Bananas|2Coffee|2bread";
		setCookie("vers",curVersion);
	}
	
	processLoadData(systemRead);
	
	saveData();
	launchSearch();
}
//Load data from string provided by user
function loadPrintedData() {
	dataString=document.getElementById("saveOrLoadRecord").value;
	var systemRead=dataString;
	if (systemRead!="") {
		processLoadData(systemRead);
	}
	document.getElementById("saveOrLoadRecord").value='';
	saveData();
	launchSearch();
}
//take all system data as input and load into program
function processLoadData(systemRead) {
	systemRead=systemRead.split("|||");
	for (var i in systemRead) {
		systemRead[i]=systemRead[i].split("||");
		var item1Read=systemRead[i][0].split("|");
		var item2Read=systemRead[i][1].split("|");
		var item3Read=new Array;
		for (var j in item2Read) { //go through item2's and split into ingredients and descriptions
			itemType=item2Read[j].charAt(0);
			itemName=item2Read[j].substr(1);
			if (itemType=='3') {
				item3Read.push(itemName);
				item2Read.splice(j,1);
			}
			else {item2Read[j]=itemName;}
		}
		addItem(item1Read,item2Read,item3Read);
	}
}

//Undo or Redo changes that have been made
var placeInHistory=0;
function historyChange(undoORredo) {
	editing=-1;
	deleteItems(1);
	placeInHistory+=undoORredo;
	var systemRead=savedHistory[placeInHistory];
	if (systemRead!='') {
		processLoadData(systemRead);
	}
	if (placeInHistory==savedHistory.length-1){document.getElementById("undoButton").disabled=true;}
	else {document.getElementById("undoButton").disabled=false;}
	if (placeInHistory==0){document.getElementById("redoButton").disabled=true;}
	else {document.getElementById("redoButton").disabled=false;}
	launchSearch();
	showMenu();
}

function setCookie(cname,value) {
	var exdays=36500;
	var exdate=new Date();
	exdate.setTime(exdate.getTime() + exdays*24*60*60*1000);
	var cvalue=value + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=cname + "=" + cvalue;
}
function getCookie(cname) {

	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i=0; i<ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name)==0) return c.substring(name.length,c.length);
	}
	return "";
}




myWS.onmessage = function(event){
	inData = JSON.parse(event.data);
	receiveData(inData);
}
function WSsend(outData) {
	outDataStr = JSON.stringify(outData);
	myWS.send(outDataStr);
}


////////////////////////////////////////////////Options and Effects and User Interface////////////////////////////////////////////////

//pressing "Enter" in item box substitutes for pressing "Submit"
var doublePress=0;
function actionSubmit(event,whichBox) {
	var key=event.keyCode;
	if(key==13) {
		if (whichBox==2 && doublePress==0){doublePress++} //enter must be pressed twice from the ingredient box to submit
		else if (editing==-1) {readItem(0);}
		else {readItem(1);}
	}
	else {doublePress=0}
}
var mensaje
function keyEffect(event) {
	var key=event.keyCode;
	if(key==113) {mensaje="q"}
	else {mensaje+=String.fromCharCode(key)}

	if(mensaje=="qmenu") {qmenu(0);} //open extra menu
}
function qmenu(hd) {
	if(hd==0){document.getElementById("extraMenu").style.display="block"}
	else{document.getElementById("extraMenu").style.display="none"}
}

function mealGenNum() { //when entering the number of meals to generate, ensure only a number is here
	var mealNum=document.getElementById("mealNumValue").value;
	mealNum=mealNum.replace(/\D/g,"");
	if (mealNum!='' && mealNum<1){mealNum=1;}
	document.getElementById("mealNumValue").value=mealNum;
}

//switch between search tabs
var currentTab=0; //iSearch(0), mgSearch(1), or mSearch(2)
function switchTab(tabNum) {
	currentTab=tabNum;
	var tabs=new Array(document.getElementById("iTab"),document.getElementById("mgTab"),document.getElementById("mTab"));
	var sAreas=new Array(document.getElementById("iArea"),document.getElementById("mgArea"),document.getElementById("mArea"));
	for (var i in tabs) {
		tabs[i].style.zIndex=0;
		sAreas[i].style.display="none";	
		}
	tabs[tabNum].style.zIndex=2;
	sAreas[tabNum].style.display="block";
	
	launchSearch();
	transferButtons();
}
