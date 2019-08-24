
/**
 * @info - A version of `ng-view` that offers the ability to use nested views via a `directives` map object bound to a path using the standard `$routeProvider` methods.
 * <br>
 * IMPORTANT: `p-view` loads views via **directives** and **contexts**, NOT templates.
 * <br>
 * For example, `$routeProvider.when( "/dashboard/account", { directives: { "main": "dashboard", "panel": "account" }, refresh: { "panel": true } } )`
 * <br>
 * Meaning that changing the path to `/dashboard/account` would load a view via a directive called `dashboard` into the element in the main application with `p-view` set to "main".
 * Once the "dashboard" view was loaded, the "account" view would be loaded, via the `account` directive, into an element in the dashboard view with `p-view` set to "panel",
 * if the element exists.
 * <br>
 * ADDITIONALLY: If there is no value set for the property with the same name as the current **context** on the route directives object, `p-view` checks the `$routeParams` for a property with its context name.
 * <br>
 * The `refresh` object on a route allows a context to **reload the current view** if it is being requested again while already loaded.
 * <br>
 * ADDITIONALLY: Views may also be loaded using the `p-load-view` setting which will **override the current context**.
 * */

/**
 * @info - This tag includes all of the functionality from the [p-layout-container](layout/container.md) tag.
 * */

/**
 * @tags - Advanced
 * */

exports.directive = function( node, parentList ){
	
	node.attr[ "p-layout-container" ] = "";
	
};
