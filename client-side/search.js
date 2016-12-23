//Class to handle searches

class SearchArea {
	constructor(graph) {
		this.name = "search"
		this.graph = graph;
		this.closet = new Closet(this, {
			"appendLocation": "#search_results",
			"className": "search_results_closet",
			"isDraggable": true,
			"isBoxXable": false,
			"XAction": undefined,
		})
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
		return el.id.match(/[^_]+$/);
	}

	//switch between search tabs
	switchTab(el) {
		// if click was current selection, do nothing
		if (!this.switchTab(el)) {return}

		//this.launchSearch();
		//transferButtons();
	}

	// Switch the tab that is selected when the user clicks a new one
	switchTab(newTabEl) {
		// If clicked tab is already selected, do nothing
		var oldTab = this.selectedTab;
		var newTab = this.getElName(newTabEl);
		if (oldTab === newTab) return false;

		// unselect old tab
		this.tab[oldTab].removeClass("tab_selected");
		this.tab[oldTab].addClass("tab_unselected");
		this.sWindow[oldTab].removeClass("area_selected");
		this.sWindow[oldTab].addClass("area_unselected");
		// select new tab
		this.tab[newTab].removeClass("tab_unselected");
		this.tab[newTab].addClass("tab_selected");
		this.sWindow[newTab].removeClass("area_unselected");
		this.sWindow[newTab].addClass("area_selected");

		return true
	}


	///// Searches

	// Commence searching
	launchSearch() {
		let searchType = this.selectedTab;
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
		var searchStr = nameTrim(this.searchBox.mealSearch.val());
		var mealList = graph.getNodesByID_partial("meal", searchStr) // note that if searchStr is "", this returns ALL meals
		// clear all meals then show search results
		this.closet.destructBoxes()
		for (let meal of mealList) {
			if (!meal.inMenu) {
				this.closet.add(meal)
			}
		}
	}
	// Search by Ingredient
	ingrSearch() {
		alert("I haven't been programmed yet!")
	}



}
