//Class to handle searches

class SearchArea {
	constructor(graph) {
		this.name = "search"
		this.graph = graph;
		this.closet = new SearchCloset(this)
		this.tab = {
			mealSearch: $("#tab_mealSearch"),
			ingrSearch: $("#tab_ingrSearch"),
			menuGenerator: $("#tab_menuGenerator"),
		};
		this.sWindow = {
			mealSearch: $("#sWindow_mealSearch"),
			ingrSearch: $("#sWindow_ingrSearch"),
			menuGenerator: $("#sWindow_menuGenerator"),
		};
		this.searchBox = {
			mealSearch: $("#mealSearch"),
			ingrSearch: $("#ingrSearch"),
			menuGenerator: $("#mealSpecifications"),
		};
	}

	get selectedTab() {
		for (let name in this.tab) {
			if (this.tab[name].hasClass("tab_selected")) {
				return name
			}
		}
	}

	getElName(el) {
		return el.id.match(/[^_]+$/)
	}

	// Switch the tab that is selected when the user clicks a new one
	switchTab(newTabEl) {
		// If clicked tab is already selected, do nothing
		var oldTab = this.selectedTab
		var newTab = this.getElName(newTabEl)
		if (oldTab === newTab) { return } 

		// unselect old tab
		this.tab[oldTab].removeClass("tab_selected")
		this.sWindow[oldTab].removeClass("window_selected")
		// select new tab
		this.tab[newTab].addClass("tab_selected")
		this.sWindow[newTab].addClass("window_selected")

		this.launchSearch()
	}


	///// Searches

	// Commence searching
	launchSearch() {
		let searchType = this.selectedTab
		if (searchType === "mealSearch") {
			this.mealSearch()
		}
		else if (searchType === "ingrSearch") {
			this.ingrSearch()
		}
		else throw 'unknown search type'
	}

	// Search meal by name
	mealSearch() {
		var searchStr = nameTrim(this.searchBox.mealSearch.val())
		var mealList = graph.getNodesByID_partial("meal", searchStr) // note that if searchStr is "", this returns ALL meals
		mealList = mealList.filter(function(meal) {return !meal.inMenu})
		this.closet.addNodes(mealList, true)
	}
	// Search by Ingredient
	ingrSearch() {
		alert("I haven't been programmed yet!")
	}



}
