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
			mealLookup: $("#tab_mealLookup"),
			ingrSearch: $("#tab_ingrSearch"),
			menuGenerator: $("#tab_menuGenerator"),
		};
		this.sWindow = {
			mealLookup: $("#sWindow_mealLookup"),
			ingrSearch: $("#sWindow_ingrSearch"),
			menuGenerator: $("#sWindow_menuGenerator"),
		};
		this.searchBox = {
			mealLookup: $("#mealLookup"),
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
		if (searchType == "mealLookup") {
			this.mealLookup();
		}
		else if (searchType == "ingrSearch") {
			this.ingrSearch();
		}
	}

	// Search by by name
	mealLookup() {
		var searchStr = nameTrim(this.searchBox.mealLookup.val());

		// If they leave it blank, show all meals
		var mealNodes = graph.getNodesByID_partial("meal", "")
		if (searchStr === "") {
			for (let meal of mealNodes) {
				if (!meal.inMenu) {
					meal.addToMealResults();
				}
			}
		}
		else { // Otherwise, clear all then show search results
			for (let meal of mealNodes) {
				if (!meal.inMenu) {
					meal.sendToLimbo();
				}
			}

			var nodeList = graph.getNodesByID_partial("meal", searchStr)
			for (let meal of nodeList) {
				if (!mode.inMenu) {
					meal.addToMealResults();
				}
			}
		}


	}
	// Search by Ingredient
	ingrSearch() {

		alert("I haven't been programmed yet!")


	}



}
