// Class to handle user account

class UserAccount {
	constructor(graph) {
		this.username = ""
		this.guest = false
		this.tab = {
			login: $("#AccountTab_login"),
			signup: $("#AccountTab_signup"),
		}

	}

	get selectedTab() {
		for (let name in this.tab) {
			if (this.tab[name].hasClass("tab_selected")) {
				return name
			}
		}
	}

	getElName(el) {
		return el.id.match(/[^_]+$/)[0]
	}

	// Switch the tab that is selected when the user clicks a new one
	switchTab(newTabEl) {
		// If clicked tab is already selected, do nothing
		var oldTab = this.selectedTab
		var newTab = this.getElName(newTabEl)
		if (oldTab === newTab) { return }

		// unselect old tab
		this.tab[oldTab].removeClass("tab_selected")
		// select new tab
		this.tab[newTab].addClass("tab_selected")

		if (newTab === "login") {
			$("#loginButton").val("Login")
		}
		else if (newTab === "signup") {
			$("#loginButton").val("Sign Up")
		}
		$("#loginResponse").html("")
	}

	// Activates when login/signup button is activated. Figure out which action it is and proceed
	loginPress() {
		var tab = this.selectedTab
		if (tab === "login") {
			this.serverLogin()
		} else {
			this.signup()
		}

	}

	// Deal with Logging in
	serverLogin() {
		// First Read the username and password fields
		$("#loginResponse").html('') // clear message
		let username = $("#username").val()
		let userpass = $("#password").val()
		let outData = {
			"username" : username,
			"password" : userpass,
		}

		server.send("login", outData, this.login.bind(this))

	}
	// Handle login information from the server
	login(inData) {
		let success = inData.status;
		if (!success) { // unsuccessful
			$("#loginResponse").html("Unsuccessful Login Attempt")
			return
		}

		// Successfully logged in
		let username = inData.username;
		this.username = username;
		$("#accountButton").val("Welcome " + username)

		windowManage({
			"account" : false,
			"recipeDesc" : false,
		})
		$("#username").val("")
		$("#password").val("")

		// Import all of the users data from the server
		this.importData(inData.data);

	}
	guestLogin() {
		// no actual logging in occurs.  local javascript runs as usual.
		windowManage({
			"account" : false,
			"recipeDesc" : false,
		})
		this.guest = true
		server.mute = true
	}
	// Create a new user account
	signup() {
		// First check the username
		$("#loginResponse").html('') // clear message
		let username = $("#username").val()
		let password = $("#password").val()
		let outData = {
			"username" : username,
			"password" : password,
		}
		server.send("add-user", outData, this.signupResponse.bind(this))
	}
	signupResponse(inData, outData) {
		let success = inData.status
		if (!success) {
			$("#loginResponse").html("Username Invalid or Unavailable")
			return
		}
		this.serverLogin()
	}

	// Import ALL of the server's data for this user
	importData(data) {
		// While importing is happening, as nodes, etc. are created
		// mute all outgoing messages
		server.mute = true;

		// data should be an object whose keys are node IDs
		// the contents of each should contain all required node information
		for (let id in data) {
			// Make it easier to access node for edges
			data[id].node = graph.addNode(data[id].type, data[id].shownName)
			// Any additional relevant fields...
			let info = data[id].info
			if (Array.isArray(info)) { // make sure its not stored as an array if empty
				info = {}
			}
			if (data[id].node.type === "meal" && !("instructions" in info)) {
				info["instructions"] = ""
			}
			data[id].node.info = info
		}
		// Repeat loop but for edges
		for (let id1 in data) {
			let edges = data[id1].edges;
			for (let id2 of edges) {
				graph.addEdge(data[id1].node, data[id2].node)
			}
		}

		server.mute = false

		searchArea.launchSearch()
	}

	// Log the user out
	logout() {
		if (this.guest === false) {
			server.send("logout", {})
			this.username = ""
		} else {
			this.guest = false
			this.mute = false
		}
		graph.wipe()
		server.queries = {}
		$("input[type='text']").val("")
		windowManage({"account" : true}) // show account window now
	}

}
