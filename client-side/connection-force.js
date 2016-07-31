// This file holds the floaty graph-animation code

/////////////////////////////////////////////////////Function to add more Items/////////////////////////////////////////////////////

//editItem should be here
// item class; stores item name, associated keywords, and representative object (aka itemBox aka ibox)
function itemObject(node) { // CLASS
// MIGRATE all of this into the Node class.
	this.chosen = 0
	this.found = 0
	this.ibox = new itemBox(this.node) // for the ANIMATION
}

///////////////////////// Function to search and display items based on searched items /////////////////////////
var foundItemList = []
function cf_namespace_search() { // search stored data (called after every keystroke)

	foundItemList=new Array();
	var numberFound=0; //number of items found so far

	// read keywords
	var searchedItems=document.getElementById("itemSearch").value;
	searchedItems=searchedItems.replace(/&{2,}/ig,"&&");
	searchedItems=searchedItems.replace(/\band\b/ig,"&&");
	searchedItems=searchedItems.replace(/\|{2,}/ig,"||");
	searchedItems=searchedItems.replace(/\bor\b|,/ig,"||");
	searchedItems=searchedItems.replace(/&&(\s*(&&|\|\|))+/ig,"&&");
	searchedItems=searchedItems.replace(/\|\|(\s*(&&|\|\|))+/ig,"||");
	searchedItems=searchedItems.replace(/&&\s*$/ig,"and");
	searchedItems=searchedItems.replace(/\|\|\s*$/ig,"or");
	searchedItems=searchedItems.replace(/(^|\&&|\|\||\()((?:[^(](?!$|\)|&&|\|\|))*.(?=$|\)|&&|\|\|))/g,"$1cf_namespace_isConnected((\"$2\",temp)");

	//cycle through all items and compare to search criteria
	for (var i in itemList) {
		var temp=itemList[i];
		if (eval(searchedItems)) { // do we need to replace things like "one" with the OBJECT POINTER?
			itemList[i].found=1;
			numberFound=foundItemList.push(itemList[i]);
		}
		else {itemList[i].found=0;}
	}


	clearInterval(t1); //halt animation while connections are redefined
	// loop through all items to find what other found items they are connected to
	// TO DELETE.  We should just take the subgraph consisting of the found items, and use that for the connections.
	for (var i=0;i<foundItemList.length-1;i++) {
		foundItemList[i].ibox.connectedObjects=new Array();
		foundItemList[i].ibox.unconnectedObjects=new Array();
		for (var j=i+1;j<foundItemList.length;j++) {//only record one side of connection
			if (foundItemList[i].connections.indexOf(foundItemList[j])!=-1) {
				foundItemList[i].ibox.connectedObjects.push(foundItemList[j].ibox);}
			else {foundItemList[i].ibox.unconnectedObjects.push(foundItemList[j].ibox);}
		}
	}
	if (numberFound>0) {
		foundItemList[numberFound-1].ibox.connectedObjects=new Array();
		foundItemList[numberFound-1].ibox.unconnectedObjects=new Array();
	}

	for(var i in foundItemList){ //if item is removed from search, chosen=0
		foundItemList[i].chosen*=foundItemList[i].found;
		foundItemList[i].ibox.ID.style.opacity=1-foundItemList[i].chosen*.5;
	}

	adamandeve();//restart animation
}

// is searchWord within order of connection of item
function cf_namespace_isConnected(searchWord,item) {
	searchWord=searchWord.trim();
	searchWord=searchWord.toLowerCase();
	if(itemListStrings.indexOf(searchWord)==-1) {return false}
	searchWord=itemList[itemListStrings.indexOf(searchWord)];

	var connectedItemList=orderExpand(item);//returns all items connected to item in order searchLinkOrder
	if (connectedItemList.indexOf(searchWord)==-1) {return false}
	else {return true}
}
//returns all items connected to item in order searchLinkOrder
function orderExpand(item) {
	var orderSearch=1; //keeps track of loop iterations
	var numberFound=1;
	var connectedItemList=[item];
	var oldNumberFound=numberFound;
	while (orderSearch <= searchLinkOrder || (searchLinkOrder==-1 && orderSearch!=0)) { //cycle through addition times to match order
		for (var i in connectedItemList) { //cycle through found items
			for (var j in connectedItemList[i].connections) { //check each connected item
				if (connectedItemList.indexOf(connectedItemList[i].connections[j])==-1) {
					numberFound=connectedItemList.push(connectedItemList[i].connections[j]);
				}
			}
		}
		orderSearch++
		if (numberFound==oldNumberFound) {orderSearch=searchLinkOrder+1;}
		else {oldNumberFound=numberFound;}
	}
	return connectedItemList
}

///////////////////////////////////////////////////////Choose and Edit Items//////////////////////////////////////////////////////

//process when user chooses to edit item(s)
var editing=-1;
function cf_namespace_choose(wch) {
	editing=-1;
	document.getElementById("editButton").disabled=true;

	if(wch==-1) { //select all items
		for(var i in foundItemList) {
			foundItemList[i].chosen=1;
			foundItemList[i].ibox.ID.style.opacity=.5;
		}
	}
	else if(wch==-2) { //unselect all items
		for(var i in foundItemList) {
			foundItemList[i].chosen=0;
			foundItemList[i].ibox.ID.style.opacity=1;
		}
	}
	else if (itemList[itemListStrings.indexOf(wch)].chosen==0) { //select
		editing=itemListStrings.indexOf(wch);
		itemList[editing].chosen=1;
		itemList[editing].ibox.ID.style.opacity=.5;
		document.getElementById("editButton").disabled=false;
		document.getElementById("item1").value=itemList[editing].shownName;
		var connectionNames=new Array();
		for (var i in itemList[editing].connections) {
			connectionNames[i]=itemList[editing].connections[i].shownName;
		}
		document.getElementById("item2").value=connectionNames.join(", ");
	}
	else { //deselect
		itemList[itemListStrings.indexOf(wch)].chosen=0;
		itemList[itemListStrings.indexOf(wch)].ibox.ID.style.opacity=1;
	}
}

// delete selected items
function cf_namespace_deleteItems() {
	for(var i=itemList.length-1;i>=0;i--) { //start at end so stored indices don't change
		if(system[i].chosen==1) {
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
	cf_namespace_search();
	cf_namespace_saveData();
}



/////////////////////////////////////////////Access, load, & set cookies and variables////////////////////////////////////////////

var colors = []
var colorReset=new Array("#EAEBD5","#0037F0","#60FF60","#FF3030");
//load cookie data or default values if no cookies
function ___loadUserData() {

	// load items and colors somehow
	itemList=new Array();
	itemListStrings=new Array();
	colors=new Array(colorReset[0],colorReset[1],colorReset[2],colorReset[3]);

}



////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////object control//////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////// constants
//mass and mouse constants
var mousemass=500;	//mass of the mouse
var mouseradius=7;	//radius of the mouse
var defaultMass=500;		//level 1 mass
var bmass2=5000;	//level 2 mass

//simulation time constants
var iter=10;	  //simulation speed, in milliseconds
var sp=iter/1000; //dt of movement in seconds

//gravity constants
var xgravity=0; // universal screen gravity
var ygravity=0;

//extra effects
var centerrooted=1; // objects drawn to center? (1=yes)
var centerforce=.25 // force to draw objects to center
var rooted=0; // objects rooted to starting position? (o=no, 1=yes)
var rootforce=100; // force to draw objects back to start
var mousefreeze=0; // objects freeze within mfreezerad of mouse? (0=no)
var mfreezerad=100; // radius of mousefreeze effect

// speed control
var airresist=.996;
var airresistList=.92;// different resistance in list mode: stability is quicker

var minrad=15; //minimum effective distance between any two objects
var maxAcc=4000;
var maxvel=800 //maximum velocity before super resistive force
var maxmax=3   //absolute maximum factor higher than maxvel an object can get
var velresist=.99 //factor to multiply by if exceeding maxvel

var defg=2000;
var defr=100;
//object to store g constants
var gconsts = {
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
var vWall=new Array();
var hWall=new Array();
function setWalls () {
	var temp1=document.getElementById("options");
	var temp2=document.getElementById("displayarea");
	var t1top=temp1.offsetTop;
	var t1left=temp1.offsetLeft;
	var t1height=temp1.clientHeight+2;
	var t1width=temp1.clientWidth+2;
	var t2top=temp2.offsetTop;
	var t2left=temp2.offsetLeft;
	var t2height=temp2.clientHeight+2;
	var t2width=temp2.clientWidth+2;
	vWall[0]=new VertWall(1,t1top,t1top+t1height,t1left+t1width)
	vWall[1]=new VertWall(1,t2top,t2top+t2height,t2left+t2width)
	hWall[0]=new HoriWall(1,t1left,t1left+t1width,t1top+t1height)
	hWall[1]=new HoriWall(1,t2left,t2left+t2width,t2top+t2height)
}

////////////////////////////////// itemBox object constructor //////////////////////////////////
function editItem(item1Value,item2Value) {alert("DONT COME HERE!!!")
// this may be needed when the itemBox gets UPDATED with some new name or window resize, etc
		itemIdNum[editing].ibox.ID.innerHTML=itemVal;
		itemIdNum[editing].ibox.hrad=itemIdNum[editing].ibox.ID.clientWidth/2;
		itemIdNum[editing].ibox.vrad=itemIdNum[editing].ibox.ID.clientHeight/2;

		for (var kk in keywords) { //cycle through keywords to add new ones to list
			if (keyList[0].lastIndexOf(keywords[kk])==-1) {
				keyNum=keyList[0].push(keywords[kk]); //add keyword to list and return new length
				keyList[1].push(L2Set.shift()); //store pointer for object

				keyList[1][keyNum-1].ID.innerHTML=keywords[kk]; //write the name in
				keyList[1][keyNum-1].hrad=keyList[1][keyNum-1].ID.clientWidth/2; //update value of width
				keyList[1][keyNum-1].vrad=keyList[1][keyNum-1].ID.clientHeight/2; //update value of height
			}
		}
		cf_namespace_choose(editing)
	cf_namespace_saveData();
	cf_namespace_search();
}
function itemBox(node) {
	this.node = node
	let itemName = this.node.shownName
	//initialize coor, vel, and acc
	this.xstart=-50; //root location
	this.ystart=-50;
	this.xpos=-50;
	this.ypos=-50;
	this.xvel=0;
	this.yvel=0;
	this.xacc=0;
	this.yacc=0;

	this.centerrooted=centerrooted; // object rooted to center?
	this.rooted=rooted; // is this object rooted to start?

	// TO REPLACE WITH node.neighbors (edges) if that makes sense:
	this.connectedObjects=new Array(); //list of objects this object is connected to
	this.unconnectedObjects=new Array(); //list of objects this object is not connected to

	this.level=1; //Level of object (all are level 1 for now)
	this.hrad=this.ibox.ID.clientWidth/2; //initial width
	this.vrad=this.ibox.ID.clientHeight/2;

	this.ID=document.createElement("div"); //create a new div element
	this.ID.innerHTML = itemName;
	this.ID.setAttribute("id","ID"+itemName);
	this.ID.setAttribute("onclick","cf_namespace_choose('"+itemName.toLowerCase()+"')");
	this.ID.setAttribute("class","wordObjectItem");
	this.ID.setAttribute("STYLE","left:-50px; top:-50px;");
	document.body.appendChild(this.ID);

	//////////////////////////////////////////////
	///////////////////methods////////////////////
	//////////////////////////////////////////////

	this.mass = function() {
		return defaultMass * Math.max(1, Math.pow((this.connections.length), 1))
	}

	this.toStart = function() { //updates object coordinates
		this.xpos=this.xstart;
		this.ypos=this.ystart;
		this.xvel=0;
		this.yvel=0;
		this.draw()
	};

	this.draw = function() { //updates actual object location in window
		this.ID.style.left=this.xpos-this.hrad;
		this.ID.style.top=this.ypos-this.vrad;
	};

	this.calcDist = function(other,displace) { //calculate angle and distant between 2 objects
		//displace is 1 if subtracting out the radii
		var tempx=other.xpos-this.xpos;
		var tempy=other.ypos-this.ypos;
		var tempangle=Math.atan2(tempy,tempx);
		var tempx=Math.max(Math.abs(tempx)-(this.hrad+other.hrad)*displace,0)
		var tempy=Math.max(Math.abs(tempy)-(this.vrad+other.vrad)*displace,0)
		var tempdist=pythag(tempx,tempy);
		return new Array(tempdist,tempangle)
	};

	this.rootDist = function() { //calculate distance to root if rooted
		var tempx=this.xstart-this.xpos;
		var tempy=this.ystart-this.ypos;
		var rootdistance=Math.sqrt(tempx*tempx+tempy*tempy);
		var rootangle=Math.atan2(tempy,tempx);
		return new Array(rootdistance,rootangle)
	};

	this.centerRootDist = function () { //calculate distance to center if center force is on
		var tempx=hlen/2-this.xpos;
		var tempy=vlen/2-this.ypos;
		var centerdist=Math.sqrt(tempx*tempx+tempy*tempy);
		var centerangle=Math.atan2(tempy,tempx);
		return new Array(centerdist,centerangle)
	};

	this.sumForces = function () { // calculate and sum all individual forces
		var force
		// universal gravity
		this.xacc+=xgravity;
		this.yacc+=ygravity;

		// root force
		if (this.rooted==1 || displaymethod==1) { //This is the only force when list display(1) is in effect
			var rootvar=this.rootDist();
			force=rootvar[0]*rootforce;
			this.xacc+=force*Math.cos(rootvar[1]);
			this.yacc+=force*Math.sin(rootvar[1]);
		}

		//If floating display(2) is in effect, calculate forces between objects
		if (displaymethod==2) {
			if (this.centerrooted==1) {
				var centervar=this.centerRootDist();
				force=Math.sqrt(centervar[0])*centerforce;
				this.xacc+=force*Math.cos(centervar[1]);
				this.yacc+=force*Math.sin(centervar[1]);
			}
			// mouse force
			if (mouseOnorOff==1) {
				var baseg=gconsts.mouse; //store object base
				//calculate distance and angle
				var tempx=x-this.xpos;
				var tempy=y-this.ypos;
				var mousedist=pythag(tempx,tempy);
				var mouseangle=Math.atan2(tempy,tempx);

				force=(baseg.attrep*baseg.gconst*mousemass*this.mass())/Math.pow(mousedist,baseg.forcePower); //force is a temporary variable
				if(baseg.forcePower2>0 && baseg.attrep==1) {
					force-=(baseg.gconst*Math.pow(baseg.forceradius,baseg.forcePower2-baseg.forcePower)*mousemass*this.mass())/Math.pow(mousedist,baseg.forcePower2)
				}
				this.xacc+=force*Math.cos(mouseangle)/this.mass();
				this.yacc+=force*Math.sin(mouseangle)/this.mass();
			}

			//connected item forces
			baseg=gconsts.connected;
			for (var i in this.connectedObjects) {
				var tempvals=this.calcDist(this.connectedObjects[i],0)
				var currdist=tempvals[0];
				var currangle=tempvals[1];
				force=(baseg.attrep*baseg.gconst*this.connectedObjects[i].mass()*this.mass())/Math.pow(currdist,baseg.forcePower);
				if(baseg.forcePower2>0 && baseg.attrep==1) {
					force-=(baseg.gconst*Math.pow(baseg.forceradius,baseg.forcePower2-baseg.forcePower)*this.connectedObjects[i].mass()*this.mass())/Math.pow(currdist,baseg.forcePower2)
				}
				this.xacc+=force*Math.cos(currangle)/this.mass();
				this.yacc+=force*Math.sin(currangle)/this.mass();
				//equal and opposite force on the other object:
				this.connectedObjects[i].xacc-=force*Math.cos(currangle)/this.connectedObjects[i].mass();
				this.connectedObjects[i].yacc-=force*Math.sin(currangle)/this.connectedObjects[i].mass();
			}

			//unconnected item forces
			baseg=gconsts.unconnected;
			for (var i in this.unconnectedObjects) {
				var tempvals=this.calcDist(this.unconnectedObjects[i],1)
				currdist=tempvals[0];
				currangle=tempvals[1];
				force=(-baseg.gconst1*this.unconnectedObjects[i].mass()*this.mass())/Math.pow(currdist,baseg.forcePower1);
				force+=(-baseg.gconst2*this.unconnectedObjects[i].mass()*this.mass())/Math.pow(currdist,baseg.forcePower2);
				this.xacc+=force*Math.cos(currangle)/this.mass();
				this.yacc+=force*Math.sin(currangle)/this.mass();
				//equal and opposite force on the other object:
				this.unconnectedObjects[i].xacc-=force*Math.cos(currangle)/this.unconnectedObjects[i].mass();
				this.unconnectedObjects[i].yacc-=force*Math.sin(currangle)/this.unconnectedObjects[i].mass();
			}
		}
	}

	this.applyForces = function () { // add individual forces and apply to velocity and distance

		// apply acceleration to velocity
		var totalAcc=pythag(this.xacc,this.yacc)
		if (totalAcc>maxAcc) {this.xacc*=maxAcc/totalAcc;this.yacc*=maxAcc/totalAcc}
		this.xvel+=this.xacc*sp;
		this.yvel+=this.yacc*sp;

		//apply drag (also for objects that are too speedy)
		if (displaymethod==1) {this.xvel*=airresistList;
			this.yvel*=airresistList;}
		else {this.xvel*=airresist;
			this.yvel*=airresist;}

		if (pythag(this.xvel,this.yvel)>=maxvel) {
			this.xvel*=velresist;
			this.yvel*=velresist;
		}
		if (pythag(this.xvel,this.yvel)>=maxvel*maxmax) {
			this.xvel/=maxmax;
			this.yvel/=maxmax;
		}

		// mousefreeze?
		if (mousefreeze==1 && this.mousedist<=mfreezerad && displaymethod==2) {
			this.xvel=0;
			this.yvel=0;
		}

		this.xpos+=this.xvel*sp;
		this.ypos+=this.yvel*sp;


		// wall bouncing
		var lP=this.xpos-this.hrad;//shortcut variables
		var rP=this.xpos+this.hrad;
		var tP=this.ypos-this.vrad;
		var bP=this.ypos+this.vrad;

		//Horizontal
		for (var i in hWall) {
			if (hWall[i].side==1 && rP>=hWall[i].lBound && lP<=hWall[i].rBound && tP-this.yvel*sp>=hWall[i].yLine && hWall[i].yLine>=tP) { //top
				this.ypos+=2*(hWall[i].yLine-tP);
				this.yvel=Math.abs(this.yvel);
			}
			else if (hWall[i].side==-1 && rP>=hWall[i].lBound && lP<=hWall[i].rBound && bP>=hWall[i].yLine && hWall[i].yLine>=bP-this.yvel*sp) { //bottom
				this.ypos+=2*(hWall[i].yLine-bP);
				this.yvel=-Math.abs(this.yvel);
			}
		}
		//Vertical
		for (var i in vWall) {
			if (vWall[i].side==1 && bP>=vWall[i].tBound && tP<=vWall[i].bBound && lP-this.xvel*sp>=vWall[i].xLine && vWall[i].xLine>=lP) { //left
				this.xpos+=2*(vWall[i].xLine-lP);
				this.xvel=Math.abs(this.xvel);
			}
			else if (vWall[i].side==-1 && bP>=vWall[i].tBound && tP<=vWall[i].bBound && rP>=vWall[i].xLine && vWall[i].xLine>=rP-this.xvel*sp) { //right
				this.xpos+=2*(vWall[i].xLine-rP);
				this.xvel=-Math.abs(this.xvel);
			}
		}

		//window walls
		if (bP>=vWall[i][0] && tP<=vWall[i][1] && Math.min(lP,lP-this.xvel*sp)<=vWall[i][2] && vWall[i][2]<=Math.max(lP,lP-this.xvel*sp)) { //left
			this.xpos+=2*(vWall[2]-lP);
			this.xvel*=-1;
		}
		else if (bP>=vWall[i][0] && tP<=vWall[i][1] && Math.min(rP,rP-this.xvel*sp)<=vWall[i][2] && vWall[i][2]<=Math.max(rP,rP-this.xvel*sp)) { //right
			this.xpos+=2*(vWall[2]-rP);
			this.xvel*=-1;
		}

		if (lP<0) { //Left
			this.xpos+=-2*lP;
			this.xvel*=-1;
		}
		if (rP>hlen) { //Right
			this.xpos+=2*(hlen-rP);
			this.xvel*=-1;
		}
		if (tP<0) { //Top
			this.ypos+=-2*tP;
			this.yvel*=-1;
		}
		if (bP>vlen) { //Bottom
			this.ypos+=2*(vlen-bP);
			this.yvel*=-1;
		}

		/* Removed for now because walls are completely elastic
		//stabilize at wall
		if (lP < .5 && this.xvel<0) {
			this.xpos=this.hrad;}
		else if (rP>hlen-.5 && this.xvel>0) {
			this.xpos=hlen-this.hrad;}
		if (tP < .5 && this.yvel<0) {
			this.ypos=this.vrad;}
		else if (bP>vlen-.5 && this.yvel>0) {
			this.ypos=vlen-this.vrad;}
		*/
		this.draw(); //update object on screen
	};
}

//length of hypotenuse, with a minimum return value of minrad
function pythag(qa,qb) {
	return Math.max(Math.sqrt(qa*qa+qb*qb),minrad);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var cont
var t1
//Initial launch of objects (this is called following a new
//search, adding/removing NEW objects from the screen)
function adamandeve() {
	resiz(); //ensure all window variables are set correctly

	for(var i in itemList) { //
		if (itemList[i].ibox.xstart==-50 || itemList[i].ibox.xpos==-50) {
			itemList[i].ibox.toStart();
		}
	}
	launch();
}

//adjust for change in window size. Calculate all dimensions
var hlen
var vlen
//onresize= function (){resiz()};
function resiz() {
	hlen=document.body.clientWidth;
	vlen=document.body.clientHeight;
	setWalls(); //set walls, such as the sides of textareas

	//reset all objects first to offscreen
	for (var i in itemList) {
		itemList[i].ibox.xstart=-50;
		itemList[i].ibox.ystart=-50;
	}

	//update start position of all found objects
	var pleft=hWall[1].lBound+5;
	var ptop=hWall[1].yLine+5
	var newTop=ptop;
	for(var i in foundItemList) {
		foundItemList[i].ibox.xstart=pleft+foundItemList[i].ibox.hrad;
		foundItemList[i].ibox.ystart=newTop+foundItemList[i].ibox.vrad;
		//alert("xstart: "+foundItemList[i].ibox.newTop+"  ;  ystart: "+foundItemList[i].ibox.ystart)
		newTop+=2*foundItemList[i].ibox.vrad+2;
	}
}

//begin simulation (just sets interval)
function launch() {
	cont=1;
	t1=setInterval("beginp()",iter);
}
//one instance of ball movement, taking into consideration all forces
function beginp() {
	for(var i in foundItemList) { // calculate forces
		foundItemList[i].ibox.xacc=0;
		foundItemList[i].ibox.yacc=0;
	}
	for(var i in foundItemList) { // calculate forces
		foundItemList[i].ibox.sumForces();
	}
	for(var i in foundItemList) { // apply forces
		foundItemList[i].ibox.applyForces();
	}
}

////////////////////////////////////////////////Options & Key and Mouse Effects////////////////////////////////////////////////

// switch between list(1) and floating(2) display
// default is floating(2)
var displaymethod=2;
function changeopt(opt) {
	displaymethod = opt
}
// change order of linking when searching
var searchLinkOrder=2;
function linkOrder(whichopt) {
	searchLinkOrder=whichopt;
	cf_namespace_search();
}
//update mouse location
var x=0;
var y=0;
onmousemove= function (){movement()};
function movement() {
	x=window.event.x-(-document.body.scrollLeft);
	y=window.event.y-(-document.body.scrollTop);
}
// Toggle mouse gravity by clicking button
var mouseOnorOff=0;
function mouseGravity() {
	if (con.mouseGravitySwitch.checked==true) {mouseOnorOff=1;}
	else {mouseOnorOff=0;}
}
//Toggle whether keys have an effect (by clicking the button). Focusing on any textbox will disable key effects.
var allowKeyEffects=0;
function keyEffects(opt) {
	if (con.keyEffectSwitch.checked==true && opt!=0) {allowKeyEffects=1;}
	else {con.keyEffectSwitch.checked=false;
		allowKeyEffects=0;
		//undo any key effects too
		if(cont==0) {launch();}
	}
}
//Key effects
onkeyup= function(){presed(event)};
function presed(event) {
	if (allowKeyEffects==1) {
		if (event.keyCode==32) { //'space' will (un)pause movement
			if (cont==1) {cont=0;
				clearInterval(t1);}
			else if(cont==0) {launch();}}
		else if (event.keyCode==16) { //'shift' will return all balls to their original locations
			for(var i in foundItemList) {
				foundItemList[i].ibox.toStart();
			}}
		else if (event.keyCode==17) { //'ctrl' will run through instance of time when frozen
			if (cont==0) {beginp();}}
		else if (event.keyCode==13) { //'enter' will stop all balls
			for(var i in foundItemList) {
				foundItemList[i].ibox.xvel=0;
				foundItemList[i].ibox.yvel=0;
			}}
		else if (event.keyCode==80) { //'p' prompts for command
			clearInterval(t1);
			eval(prompt('',''));
			if (cont==1) {
				launch();}}
	}
}

