//////////////////// GLOBALS ////////////////////
let graph = undefined
let recipe = undefined
let searchArea = undefined
let groceryArea = undefined
let server = undefined
let socket = undefined


/////////////////// FUNCTIONS ///////////////////
function initGlobals() {
	graph = new Graph();
	recipe = new RecipeArea(graph);
	searchArea = new SearchArea(graph);
	groceryArea = new GroceryListArea();
	server = new ServerTalk();
	socket = new Socket(server)
}

function initTriggers() {
	/* recipe area */
	$('#create_meal_button').click(function(){
		let shownName = $('#meal_input').val()
		// Before proceeding, edit clean up shownName
		shownName = cleanName(shownName);
		$('#meal_input').val(shownName); // Update in case it changed
		
		recipe.createNode('meal', shownName)
	})
	$('#remove_meal_button').click(function(){
		recipe.removeMeal()
	})
	$('.node_input').keypress(function(event) {
		let key = event.which;
		let character = String.fromCharCode(key);
		let allowedKeys = [13] // special keys
		let allowedChars = /[0-9A-Za-z _',:]/g;
		
		if (allowedKeys.indexOf(key) != -1) return true
		else if (character.match(allowedChars)) return true
		else return false
	})
	$('.node_input').keyup(function(event){
		let type = $(this).attr("data-type")
		let shownName = $(this).val()
		// Before proceeding, edit clean up shownName
		shownName = cleanName(shownName);
		$(this).val(shownName); // Update in case it changed
		
		let key = event.which;
		recipe.keyPress(key, type, shownName)
	})

	
	/***** search area *****/
	$('.Tab').click(function(){
		searchArea.switchTab(this)
	})
	$('#mealLookup, #ingrSearch').keyup(function(){
		searchArea.launchSearch()
	})

	$('#search_results').on("dragover", function(event){
		event.preventDefault();
		event.originalEvent.dataTransfer.dropEffect = "move";
	})
	$('#search_results').on("drop", function(event){
		event.preventDefault();
		let id = event.originalEvent.dataTransfer.getData("text");
		let node = graph.getNodeById(id);
		node.sendToLimbo()
		searchArea.launchSearch()
	})
	
	
	
	
	/***** grocery area *****/
	$('#menuField').on("dragover", function(event){
		event.preventDefault();
		event.originalEvent.dataTransfer.dropEffect = "move";
	})
	$('#menuField').on("drop", function(event){
		event.preventDefault();
		let id = event.originalEvent.dataTransfer.getData("text");
		let node = graph.getNodeById(id);
		node.addToMenu()
	})
	
	$('#print_button').click(function(){
		groceryArea.print()
	})

	/*
	$('#mealNumValue').keyup(mealGenNum)
	$('#generate').click(generate)
	$('.menuButtons').click(function(){
		transferMeal(this.id)
	})
	$('#saveButton').click(printSaveData)
	$('#loadButton').click(loadPrintedData)
	$('#unselectAll').click(choose)
	$('.history').click(function(){
		let id = $(this).attr('id')
		historyChange(id)
	})
	$('#qmenu').click(qmenu)
	*/
}



/*

///////////////////////// Function to search and display items based on searched items /////////////////////////

var foundItemList=new Array();
function launchSearch() { // begin ingr(0) or meal(1) search

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

//ingr search
function ingrSearchFunc() {

	var searchedItems
	searchedItems=document.getElementById("ingrSearch").value;

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
	var specList=new Array;//specList[i]=[min,max,ingr,Number added to final menu]
	var form1=/(\d+)\s*\/\s*(\d+)\s+(.+)/;
	var form2=/(\d+)\s+(.+)/;
	for (var i in rawSpecList) { //parse individual specs into min/max/ingr
		//if "#1/#2 ingr" is given, assume min#1, max=#2
		if (form1.test(rawSpecList[i])){
			specList.push([eval(RegExp.$1),eval(RegExp.$2),RegExp.$3,0])
		}
		//if "# ingr" is given, assume min=max=#
		else if (form2.test(rawSpecList[i])){
			specList.push([eval(RegExp.$1),eval(RegExp.$1),RegExp.$2,0])
		}
		//if "ingr" is given, assume min 1, max equal to genNumber
		else {
			specList.push([1,genNumber,rawSpecList[i],0])
		}
	}

	for (var i in specList) { //first go through and replace all ingrs with their pointer
		//if min>max, switch
		if (specList[i][0]>specList[i][1]){var temp=specList[i][1];
			specList[i][1]=specList[i][0];specList[i][0]=temp;}

		if (itemListStrings.indexOf(specList[i][2])!=-1) {
			var itemKey=itemList[itemListStrings.indexOf(specList[i][2])]; //store pointer
			if (itemKey.type>=2) {specList[i][2]=itemKey;} //if an ingr/description
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

		//find all menu options that contain this ingr
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

			//find all menu options that contain this ingr
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
//returns updated specList. adds tally to appropriate ingr quantities based on newly added menu item
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
//given list of currently allowed menu items, remove any meal with a maxed out ingr, then return new list
function removeMaxes(possibleMenuItems,specList) {
	for (var i in specList) {
		if (specList[i][3]>=specList[i][1]) { //if any ingr is at its max, remove it
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
	else if (section==2) { //showing ingrs from given menu items
		var bottom=document.getElementById("mealField").clientHeight;}
	else if (section==3) { //showing ingrs from given menu items
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
		itemList[i].element.style.opacity=1-itemList[i].chosen*.5;
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
			if (iIndex==-1 && currentMenu[i].connections[j].type==2) { //if this item is not on our list yet, and is an ingr, add it:
				groceryList.push(currentMenu[i].connections[j]);
				groceryListQuantity.push(1);
			}
			else if (currentMenu[i].connections[j].type==2) {groceryListQuantity[iIndex]++;} //else, tally up that ingr
		}
	}
	for (var i in groceryList) { //update each ingr to have x# after it (if applicable)
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
		if (itemList[i].type==1) {//only store if this is a menu item (assume no lone ingrs)
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
		if (itemList[i].type==1) {//only store if this is a menu item (assume no lone ingrs)
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
		for (var j in item2Read) { //go through item2's and split into ingrs and descriptions
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


////////////////////////////////////////////////Options and Effects and User Interface////////////////////////////////////////////////

//pressing "Enter" in item box substitutes for pressing "Submit"
var doublePress=0;
function actionSubmit(event,whichBox) {
	var key=event.keyCode;
	if(key==13) {
		if (whichBox==2 && doublePress==0){doublePress++} //enter must be pressed twice from the ingr box to submit
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


*/


////////////////////// MAIN //////////////////////
$(document).ready(function(){
	// jquery wait till dom loaded (see https://avaminzhang.wordpress.com/2013/06/11/document-ready-vs-window-load/ if any issues)
	initGlobals()
	initTriggers()
})
