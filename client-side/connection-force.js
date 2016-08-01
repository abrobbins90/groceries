// This file holds the floaty graph-animation code


///////////////////////// Function to search and display items based on searched items /////////////////////////


function animation_search() { // search stored data (called after every keystroke)

	g.clearFoundNodes()

	// read keywords
	let searchedItems=document.getElementById("itemSearch").value;
	searchedItems=searchedItems.replace(/&{2,}/ig,"&&");
	searchedItems=searchedItems.replace(/\band\b/ig,"&&");
	searchedItems=searchedItems.replace(/\|{2,}/ig,"||");
	searchedItems=searchedItems.replace(/\bor\b|,/ig,"||");
	searchedItems=searchedItems.replace(/&&(\s*(&&|\|\|))+/ig,"&&");
	searchedItems=searchedItems.replace(/\|\|(\s*(&&|\|\|))+/ig,"||");
	searchedItems=searchedItems.replace(/&&\s*$/ig,"and");
	searchedItems=searchedItems.replace(/\|\|\s*$/ig,"or");
	searchedItems=searchedItems.replace(/(^|&&|\|\||\()((?:[^(](?!$|\)|&&|\|\|))*.(?=$|\)|&&|\|\|))/g,"$1cf_namespace_isConnected((\"$2\",temp_node)");

	//cycle through all items and compare to search criteria
	for( let node of g.nodes ){
		let temp_node = node
		if( eval(searchedItems) ){ // do we need to replace things like "one" with the OBJECT POINTER?
			node.found = true
		}
		else{
			node.found = false
		}
	}


	clearInterval(t1); //halt animation while connections are redefined
	// loop through all items to find what other found items they are connected to
	// TO DELETE.  We should just take the subgraph consisting of the found items, and use that for the connections.


	for( let found_node of g.foundNodes ){ //if item is removed from search, chosen=0
		found_node.ibox.ID.style.opacity = 1 - found_node.chosen * 0.5
	}

	adamAndEve(); //restart animation
}

// is searchWord within order of connection of item
function cf_namespace_isConnected(searchWord,item) {
	searchWord=searchWord.trim();
	searchWord=searchWord.toLowerCase();
	if(g.nodesStrings.indexOf(searchWord) === -1) {return false}
	searchWord=g.nodes[g.nodesStrings.indexOf(searchWord)];

	let connectedItemList=orderExpand(item);//returns all items connected to item in order searchLinkOrder
	if (connectedItemList.indexOf(searchWord) === -1) {return false}
	else {return true}
}
//returns all items connected to item in order searchLinkOrder
function orderExpand(item) {
	let orderSearch=1; //keeps track of loop iterations
	let numberFound=1;
	let connectedItemList=[item];
	let oldNumberFound=numberFound;
	while (orderSearch <= searchLinkOrder || (searchLinkOrder === -1 && orderSearch!=0)) { //cycle through addition times to match order
		for (let i in connectedItemList) { //cycle through found items
			for (let j in connectedItemList[i].connections) { //check each connected item
				if (connectedItemList.indexOf(connectedItemList[i].connections[j]) === -1) {
					numberFound=connectedItemList.push(connectedItemList[i].connections[j]);
				}
			}
		}
		orderSearch++
		if (numberFound === oldNumberFound) {orderSearch=searchLinkOrder+1;}
		else {oldNumberFound=numberFound;}
	}
	return connectedItemList
}

///////////////////////////////////////////////////////Choose and Edit Items//////////////////////////////////////////////////////

//process when user chooses to edit item(s)
let editing=-1;
function cf_namespace_choose(wch) {
	editing=-1;
	document.getElementById("editButton").disabled=true;

	if(wch === -1) { //select all items
		for(let i in g.foundNodes) {
			g.foundNodes[i].chosen=1;
			g.foundNodes[i].ibox.ID.style.opacity=.5;
		}
	}
	else if(wch === -2) { //unselect all items
		for(let i in g.foundNodes) {
			g.foundNodes[i].chosen=0;
			g.foundNodes[i].ibox.ID.style.opacity=1;
		}
	}
	else if (g.nodes[g.nodesStrings.indexOf(wch)].chosen === 0) { //select
		editing=g.nodesStrings.indexOf(wch);
		g.nodes[editing].chosen=1;
		g.nodes[editing].ibox.ID.style.opacity=.5;
		document.getElementById("editButton").disabled=false;
		document.getElementById("item1").value=g.nodes[editing].shownName;
		let connectionNames=new Array();
		for (let i in g.nodes[editing].connections) {
			connectionNames[i]=g.nodes[editing].connections[i].shownName;
		}
		document.getElementById("item2").value=connectionNames.join(", ");
	}
	else { //deselect
		g.nodes[g.nodesStrings.indexOf(wch)].chosen=0;
		g.nodes[g.nodesStrings.indexOf(wch)].ibox.ID.style.opacity=1;
	}
}

// delete selected items
function cf_namespace_deleteItems() {
	for(let i=g.nodes.length-1;i>=0;i--) { //start at end so stored indices don't change
		if(system[i].chosen === 1) {
			oldObj=system[i].ibox;
			oldObj.ID.innerHTML="";
			oldObj.xstart=-50;
			oldObj.ystart=-50;
			oldObj.toStart();
			itemIdNum[eval(oldObj.ID.id.substr(3))]=0;
			L1Set.push(oldObj);
			system.splice(i,1);//removes indicated element/object from list of existing items
		}
	}
	cf_namespace_choose(-2)
	animation_search();
	cf_namespace_saveData();
}



/////////////////////////////////////////////Access, load, & set cookies and variables////////////////////////////////////////////

let colors = []
let colorReset=new Array("#EAEBD5","#0037F0","#60FF60","#FF3030");
//load cookie data or default values if no cookies
function ___loadUserData() {

	// load items and colors somehow

	colors=new Array(colorReset[0],colorReset[1],colorReset[2],colorReset[3]);

}



////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////object control//////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////// constants
//mass and mouse constants
let mousemass=500;	//mass of the mouse
let mouseradius=7;	//radius of the mouse
let defaultMass=500;		//level 1 mass
let bmass2=5000;	//level 2 mass

//simulation time constants
let iter=10;	  //simulation speed, in milliseconds
let sp=iter/1000; //dt of movement in seconds

//gravity constants
let xgravity=0; // universal screen gravity
let ygravity=0;

//extra effects
let centerrooted=1; // objects drawn to center? (1=yes)
let centerforce=.25 // force to draw objects to center
let rooted=0; // objects rooted to starting position? (o=no, 1=yes)
let rootforce=100; // force to draw objects back to start
let mousefreeze=0; // objects freeze within mfreezerad of mouse? (0=no)
let mfreezerad=100; // radius of mousefreeze effect

// speed control
let airresist=.996;
let airresistList=.92;// different resistance in list mode: stability is quicker

let minrad=15; //minimum effective distance between any two objects
let maxAcc=4000;
let maxvel=800 //maximum velocity before super resistive force
let maxmax=3   //absolute maximum factor higher than maxvel an object can get
let velresist=.99 //factor to multiply by if exceeding maxvel

let defg=2000;
let defr=100;
//object to store g constants
let gconsts = {
	connected : {
		gconst : defg, //gravity constant
		attrep : 1, //attract(1) or repel(-1)?
		forcePower : 2, //r^forcePower
		forcePower2 : 3, //also have second force? (0=no, r^forcePower2)
		forceradius : defr // if force2>0, desired equilibrium radius
	},
	unconnected : { //always repulsive
		gconst1 : 0*defg/10, //gravity constant
		forcePower1 : 1, //r^forcePower1
		gconst2 : defg/10, //second gravity constant
		forcePower2 : 2, //r^forcePower2
	},
	mouse : {
		gconst : defg, //gravity constant
		attrep : -1, //attract(1) or repel(-1)?
		forcePower : 3, //r^forcePower
		forcePower2 : 0, //also have second force? (0=no, r^forcePower2)
		forceradius : defr // if force2>0, desired equilibrium radius
	}
};

// make wall objects (wall drawn between two bounds at coordinate xLine or yLine
function VertWall (reflect,tBound,bBound,xLine) {
	this.side=reflect; //1 for right, -1 for left
	this.tBound=tBound;
	this.bBound=bBound;
	this.xLine=xLine;
}
function HoriWall (reflect,lBound,rBound,yLine) {
	this.side=reflect; //1 for down, -1 for up
	this.lBound=lBound;
	this.rBound=rBound;
	this.yLine=yLine;
}
let vWall=new Array();
let hWall=new Array();
function setWalls () {
	let temp1=document.getElementById("options");
	let temp2=document.getElementById("displayarea");
	let t1top=temp1.offsetTop;
	let t1left=temp1.offsetLeft;
	let t1height=temp1.clientHeight+2;
	let t1width=temp1.clientWidth+2;
	let t2top=temp2.offsetTop;
	let t2left=temp2.offsetLeft;
	let t2height=temp2.clientHeight+2;
	let t2width=temp2.clientWidth+2;
	vWall[0]=new VertWall(1,t1top,t1top+t1height,t1left+t1width)
	vWall[1]=new VertWall(1,t2top,t2top+t2height,t2left+t2width)
	hWall[0]=new HoriWall(1,t1left,t1left+t1width,t1top+t1height)
	hWall[1]=new HoriWall(1,t2left,t2left+t2width,t2top+t2height)
}

////////////////////////////////// ItemBox object constructor //////////////////////////////////
function editItem(item1Value,item2Value) {alert("DONT COME HERE!!!")
// this may be needed when the ItemBox gets UPDATED with some new name or window resize, etc
		itemIdNum[editing].ibox.ID.innerHTML=itemVal;
		itemIdNum[editing].ibox.hrad=itemIdNum[editing].ibox.ID.clientWidth/2;
		itemIdNum[editing].ibox.vrad=itemIdNum[editing].ibox.ID.clientHeight/2;

		for (let kk in keywords) { //cycle through keywords to add new ones to list
			if (keyList[0].lastIndexOf(keywords[kk]) === -1) {
				keyNum=keyList[0].push(keywords[kk]); //add keyword to list and return new length
				keyList[1].push(L2Set.shift()); //store pointer for object

				keyList[1][keyNum-1].ID.innerHTML=keywords[kk]; //write the name in
				keyList[1][keyNum-1].hrad=keyList[1][keyNum-1].ID.clientWidth/2; //update value of width
				keyList[1][keyNum-1].vrad=keyList[1][keyNum-1].ID.clientHeight/2; //update value of height
			}
		}
		cf_namespace_choose(editing)
	cf_namespace_saveData();
	animation_search();
}

//length of hypotenuse, with a minimum return value of minrad
function pythag(qa,qb) {
	return Math.max(Math.sqrt(qa*qa+qb*qb),minrad);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let cont
let t1
//Initial launch of objects (this is called following a new
//search, adding/removing NEW objects from the screen)
function adamAndEve() {
	resiz(); //ensure all window variables are set correctly

	for( let node of g.nodes ){ // shouldn't this be foundNodes ?
		if( node.ibox.xstart === -50 || node.ibox.xpos === -50 ){
			node.ibox.toStart()
		}
	}
	launch()
}

//adjust for change in window size. Calculate all dimensions
let hlen
let vlen
//onresize= function (){resiz()};
function resiz() {
	hlen = document.body.clientWidth;
	vlen = document.body.clientHeight;
	setWalls(); //set walls, such as the sides of textareas

	//reset all objects first to offscreen
	for (let node of g.nodes) {
		node.ibox.xstart=-50;
		node.ibox.ystart=-50;
	}

	//update start position of all found objects
	let pleft=hWall[1].lBound+5;
	let ptop=hWall[1].yLine+5
	let newTop=ptop;
	for(let node of g.foundNodes) {
		node.ibox.xstart = pleft+node.ibox.hrad;
		node.ibox.ystart = newTop+node.ibox.vrad;
		//alert("xstart: "+g.foundNodes[i].ibox.newTop+"  ;  ystart: "+g.foundNodes[i].ibox.ystart)
		newTop += 2*node.ibox.vrad+2;
	}
}

//begin simulation (just sets interval)
function launch() {
	cont=1;
	t1=setInterval("beginp()",iter);
}
//one instance of ball movement, taking into consideration all forces
function beginp() {
	for(let node of g.foundNodes) { // calculate forces
		node.ibox.xacc=0;
		node.ibox.yacc=0;
	}
	for(let node of g.foundNodes) { // calculate forces
		node.ibox.sumForces();
	}
	for(let node of g.foundNodes) { // apply forces
		node.ibox.applyForces();
	}
}

////////////////////////////////////////////////Options & Key and Mouse Effects////////////////////////////////////////////////

// switch between list(1) and floating(2) display
// default is floating(2)
let displaymethod=2;
function changeopt(opt) {
	displaymethod = opt
}
// change order of linking when searching
let searchLinkOrder=2;
function linkOrder(whichopt) {
	searchLinkOrder = whichopt;
	animation_search();
}
//update mouse location
let x=0;
let y=0;
onmousemove= function (){movement()};
function movement() {
	x=window.event.x-(-document.body.scrollLeft);
	y=window.event.y-(-document.body.scrollTop);
}
// Toggle mouse gravity by clicking button
let mouseOnorOff=0;
function mouseGravity() {
	if (con.mouseGravitySwitch.checked === true) {mouseOnorOff=1;}
	else {mouseOnorOff=0;}
}
//Toggle whether keys have an effect (by clicking the button). Focusing on any textbox will disable key effects.
let allowKeyEffects=0;
function keyEffects(opt) {
	if (con.keyEffectSwitch.checked && opt!=0) {allowKeyEffects=1;}
	else {
		con.keyEffectSwitch.checked=false;
		allowKeyEffects=0;
		//undo any key effects too
		if(cont === 0) {launch();}
	}
}
//Key effects
onkeyup= function(){presed(event)};
function presed(event) {
	if (allowKeyEffects === 1) {
		if (event.keyCode === 32) { //'space' will (un)pause movement
			if (cont === 1) {cont=0;
				clearInterval(t1);}
			else if(cont === 0) {launch();}}
		else if (event.keyCode === 16) { //'shift' will return all balls to their original locations
			for(let node of g.foundNodes) {
				node.ibox.toStart();
			}}
		else if (event.keyCode === 17) { //'ctrl' will run through instance of time when frozen
			if (cont === 0) {beginp();}}
		else if (event.keyCode === 13) { //'enter' will stop all balls
			for(let node of g.foundNodes) {
				node.ibox.xvel=0;
				node.ibox.yvel=0;
			}}
		else if (event.keyCode === 80) { //'p' prompts for command
			clearInterval(t1);
			eval(prompt('',''));
			if (cont === 1) {
				launch();}}
	}
}

