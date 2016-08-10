// an ItemBox is like a Box, but with a position and sizing (for the graph animation)


class ItemBox extends Box {


	constructor(node) {
		function destructAction() {
			// nothing yet
		}
		super(node, 'body', destructAction, "wordObjectItem")
		this.$el.get(0).setAttribute("onclick","cf_namespace_choose('"+this.node.shownName.toLowerCase()+"')")
		this.$el.css("left", "-50px")
		this.$el.css("top", "-50px")

		//initialize coor, vel, and acc
		this.xstart = -50 //root location
		this.ystart = -50
		this.xpos = -50
		this.ypos = -50
		this.xvel = 0
		this.yvel = 0
		this.xacc = 0
		this.yacc = 0

		this.centerrooted = centerrooted // object rooted to center?
		this.rooted = rooted // is this object rooted to start?

		this.level = 1 //Level of object (all are level 1 for now)
		this.hrad = this.$el.get(0).clientWidth / 2 //initial width
		this.vrad = this.$el.get(0).clientHeight / 2
	}

	//////////////////////////////////////////////
	///////////////////methods////////////////////
	//////////////////////////////////////////////

	mass() {
		return defaultMass * Math.max(1, Math.pow((this.connections.length), 1))
	}

	toStart() { //updates object coordinates
		this.xpos = this.xstart
		this.ypos = this.ystart
		this.xvel = 0
		this.yvel = 0
		this.draw()
	}

	draw() { //updates actual object location in window
		this.ID.style.left = this.xpos-this.hrad
		this.ID.style.top = this.ypos-this.vrad
	}

	calcDist(other, displace) { //calculate angle and distant between 2 objects
		//displace is 1 if subtracting out the radii
		let tempangle = Math.atan2(other.ypos - this.ypos, other.xpos - this.xpos)
		let tempx = Math.max(Math.abs(tempx)-(this.hrad+other.hrad)*displace,0)
		let tempy = Math.max(Math.abs(tempy)-(this.vrad+other.vrad)*displace,0)
		let tempdist = pythag(tempx,tempy)
		return new Array(tempdist, tempangle)
	}

	rootDist() { //calculate distance to root if rooted
		let tempx = this.xstart-this.xpos
		let tempy = this.ystart-this.ypos
		let rootdistance = Math.sqrt(tempx*tempx+tempy*tempy)
		let rootangle = Math.atan2(tempy,tempx)
		return new Array(rootdistance,rootangle)
	}

	centerRootDist() { //calculate distance to center if center force is on
		let tempx = hlen/2-this.xpos
		let tempy = vlen/2-this.ypos
		let centerdist = Math.sqrt(tempx*tempx+tempy*tempy)
		let centerangle = Math.atan2(tempy,tempx)
		return new Array(centerdist,centerangle)
	}

	sumForces() { // calculate and sum all individual forces
		let force
		// universal gravity
		this.xacc += xgravity
		this.yacc += ygravity

		// root force
		if (this.rooted === 1 || displaymethod === 1) { //This is the only force when list display(1) is in effect
			let rootvar = this.rootDist()
			force = rootvar[0]*rootforce
			this.xacc += force*Math.cos(rootvar[1])
			this.yacc += force*Math.sin(rootvar[1])
		}

		//If floating display(2) is in effect, calculate forces between objects
		if (displaymethod === 2) {
			if (this.centerrooted === 1) {
				let centervar = this.centerRootDist()
				force = Math.sqrt(centervar[0])*centerforce
				this.xacc += force*Math.cos(centervar[1])
				this.yacc += force*Math.sin(centervar[1])
			}
			// mouse force
			if (mouseOnorOff === 1) {
				let baseg = gconsts.mouse //store object base
				//calculate distance and angle
				let tempx = x-this.xpos
				let tempy = y-this.ypos
				let mousedist = pythag(tempx,tempy)
				let mouseangle = Math.atan2(tempy,tempx)

				force = (baseg.attrep*baseg.gconst*mousemass*this.mass())/Math.pow(mousedist,baseg.forcePower) //force is a temporary variable
				if(baseg.forcePower2>0 && baseg.attrep === 1) {
					force -= (baseg.gconst*Math.pow(baseg.forceradius,baseg.forcePower2-baseg.forcePower)*mousemass*this.mass())/Math.pow(mousedist,baseg.forcePower2)
				}
				this.xacc += force*Math.cos(mouseangle)/this.mass()
				this.yacc += force*Math.sin(mouseangle)/this.mass()
			}

			//connected item forces
			baseg = gconsts.connected
			for (let i in this.connectedObjects) {
				let tempvals = this.calcDist(this.connectedObjects[i],0)
				let currdist = tempvals[0]
				let currangle = tempvals[1]
				force = (baseg.attrep*baseg.gconst*this.connectedObjects[i].mass()*this.mass())/Math.pow(currdist,baseg.forcePower)
				if(baseg.forcePower2>0 && baseg.attrep === 1) {
					force -= (baseg.gconst*Math.pow(baseg.forceradius,baseg.forcePower2-baseg.forcePower)*this.connectedObjects[i].mass()*this.mass())/Math.pow(currdist,baseg.forcePower2)
				}
				this.xacc += force*Math.cos(currangle)/this.mass()
				this.yacc += force*Math.sin(currangle)/this.mass()
				//equal and opposite force on the other object:
				this.connectedObjects[i].xacc -= force*Math.cos(currangle)/this.connectedObjects[i].mass()
				this.connectedObjects[i].yacc -= force*Math.sin(currangle)/this.connectedObjects[i].mass()
			}

			//unconnected item forces
			baseg = gconsts.unconnected
			for (let i in this.unconnectedObjects) {
				let tempvals = this.calcDist(this.unconnectedObjects[i],1)
				currdist = tempvals[0]
				currangle = tempvals[1]
				force = (-baseg.gconst1*this.unconnectedObjects[i].mass()*this.mass())/Math.pow(currdist,baseg.forcePower1)
				force += (-baseg.gconst2*this.unconnectedObjects[i].mass()*this.mass())/Math.pow(currdist,baseg.forcePower2)
				this.xacc += force*Math.cos(currangle)/this.mass()
				this.yacc += force*Math.sin(currangle)/this.mass()
				//equal and opposite force on the other object:
				this.unconnectedObjects[i].xacc -= force*Math.cos(currangle)/this.unconnectedObjects[i].mass()
				this.unconnectedObjects[i].yacc -= force*Math.sin(currangle)/this.unconnectedObjects[i].mass()
			}
		}
	}

	applyForces() { // add individual forces and apply to velocity and distance

		// apply acceleration to velocity
		let totalAcc = pythag(this.xacc,this.yacc)
		if (totalAcc>maxAcc) {
			this.xacc *= maxAcc/totalAcc
			this.yacc *= maxAcc/totalAcc
		}
		this.xvel += this.xacc*sp
		this.yvel += this.yacc*sp

		//apply drag (also for objects that are too speedy)
		if (displaymethod === 1) {this.xvel *= airresistList
			this.yvel *= airresistList}
		else {this.xvel *= airresist
			this.yvel *= airresist}

		if (pythag(this.xvel,this.yvel) >= maxvel) {
			this.xvel *= velresist
			this.yvel *= velresist
		}
		if (pythag(this.xvel,this.yvel) >= maxvel*maxmax) {
			this.xvel /= maxmax
			this.yvel /= maxmax
		}

		// mousefreeze?
		if (mousefreeze === 1 && this.mousedist <= mfreezerad && displaymethod === 2) {
			this.xvel = 0
			this.yvel = 0
		}

		this.xpos += this.xvel*sp
		this.ypos += this.yvel*sp


		// wall bouncing
		let lP = this.xpos-this.hrad//shortcut variables
		let rP = this.xpos+this.hrad
		let tP = this.ypos-this.vrad
		let bP = this.ypos+this.vrad

		//Horizontal
		for (let i in hWall) {
			if (hWall[i].side === 1 && rP >= hWall[i].lBound && lP <= hWall[i].rBound && tP-this.yvel*sp >= hWall[i].yLine && hWall[i].yLine >= tP) { //top
				this.ypos += 2*(hWall[i].yLine-tP)
				this.yvel = Math.abs(this.yvel)
			}
			else if (hWall[i].side === -1 && rP >= hWall[i].lBound && lP <= hWall[i].rBound && bP >= hWall[i].yLine && hWall[i].yLine >= bP-this.yvel*sp) { //bottom
				this.ypos += 2*(hWall[i].yLine-bP)
				this.yvel = -Math.abs(this.yvel)
			}
		}
		//Vertical
		for (let i in vWall) {
			if (vWall[i].side === 1 && bP >= vWall[i].tBound && tP <= vWall[i].bBound && lP-this.xvel*sp >= vWall[i].xLine && vWall[i].xLine >= lP) { //left
				this.xpos += 2*(vWall[i].xLine-lP)
				this.xvel = Math.abs(this.xvel)
			}
			else if (vWall[i].side === -1 && bP >= vWall[i].tBound && tP <= vWall[i].bBound && rP >= vWall[i].xLine && vWall[i].xLine >= rP-this.xvel*sp) { //right
				this.xpos += 2*(vWall[i].xLine-rP)
				this.xvel = -Math.abs(this.xvel)
			}
		}

		//window walls
		if (bP >= vWall[i][0] && tP <= vWall[i][1] && Math.min(lP,lP-this.xvel*sp) <= vWall[i][2] && vWall[i][2] <= Math.max(lP,lP-this.xvel*sp)) { //left
			this.xpos += 2*(vWall[2]-lP)
			this.xvel *= -1
		}
		else if (bP >= vWall[i][0] && tP <= vWall[i][1] && Math.min(rP,rP-this.xvel*sp) <= vWall[i][2] && vWall[i][2] <= Math.max(rP,rP-this.xvel*sp)) { //right
			this.xpos += 2*(vWall[2]-rP)
			this.xvel *= -1
		}

		if (lP<0) { //Left
			this.xpos += -2*lP
			this.xvel *= -1
		}
		if (rP>hlen) { //Right
			this.xpos += 2*(hlen-rP)
			this.xvel *= -1
		}
		if (tP<0) { //Top
			this.ypos += -2*tP
			this.yvel *= -1
		}
		if (bP>vlen) { //Bottom
			this.ypos += 2*(vlen-bP)
			this.yvel *= -1
		}

		/* Removed for now because walls are completely elastic
		//stabilize at wall
		if (lP < .5 && this.xvel<0) {
			this.xpos = this.hrad}
		else if (rP>hlen-.5 && this.xvel>0) {
			this.xpos = hlen-this.hrad}
		if (tP < .5 && this.yvel<0) {
			this.ypos = this.vrad}
		else if (bP>vlen-.5 && this.yvel>0) {
			this.ypos = vlen-this.vrad}
		*/
		this.draw() //update object on screen
	}
}
