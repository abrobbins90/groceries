//Class to handle user account

class UserAccount {
	constructor(graph) {
		this.username = "" 
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
			$("#loginButton").val("Login").click(this.serverLogin)
		}
		else if (newTab === "signup") {
			$("#loginButton").val("Sign Up").click(this.signup)
		}
	}

	// Deal with Logging in
	serverLogin() {
		// First Read the username and password fields
		$("#loginResponse").val('') // clear message
		let username = $("#username").val()
		let userpass = $("#userpass").val()
		let outData = {
			"username" : username,
			"password" : userpass,
		}
		this.send("login", outData, this.login)

	}
	// Handle login information from the server
	login(inData) {
		let success = inData.status;
		if (!success) { // unsuccessful
			$("#loginResponse").val("Unsuccessful Login Attempt")
		}

		// Successfully logged in
		let username = inData.username;
		this.username = username;

		this.showAccountWindow(false)

		// Import all of the users data from the server
		this.importData(inData.data);

	}
	// Create a new user account
	signup() {
		// First check the username
		$("#loginResponse").val('') // clear message
		let username = $("#username").val()
		let userpass = $("#userpass").val()
		let outData = {
			"username" : username,
			"password" : userpass,
		}
		this.send("add-user", outData, this.signupResponse)
	}
	signupResponse(inData, outData) {
		let success = inData.success
		if (!success) {
			$("#loginResponse").val("Username Invalid or Unavailable")
			return
		}
		this.username = outData.username
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

	// Show or Hide Account Window
	showAccountWindow(TF) {
		if (TF) { // show account window
			$("AccountWindow").attr('display', 'flex')
			$("AccountBar").attr('display', 'none')
			$("MainWindow").attr('display', 'none')
		}
		else {
			$("AccountWindow").attr('display', 'none')
			$("AccountBar").attr('display', 'block')
			$("MainWindow").attr('display', 'flex')
		}
	}
}