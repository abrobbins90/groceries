//Class to handle searches

class SearchClass {
	constructor (graph) {
		this.graph = graph;
		this.tab = {
			mealLookup : $("#tab_mealLookup"),
			ingredientSearch : $("#tab_ingredientSearch"),
			menuGenerator : $("#tab_menuGenerator")
		};
		this.sWindow = {
			mealLookup : $("#sWindow_mealLookup"),
			ingredientSearch : $("#sWindow_ingredientSearch"),
			menuGenerator : $("#sWindow_menuGenerator")
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
	
	// Switch the tab that is selected when the user clicks a new one
	switchTab(newTabEl) {
		// If clicked tab is already selected, do nothing
		var oldTab = this.selectedTab;
		var newTab = this.getElName(newTabEl);
		if (oldTab === newTab) {return false}
		
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
	}
}