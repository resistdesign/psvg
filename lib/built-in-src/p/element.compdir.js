
/**
 * @info - Convert an object to any HTML element.
 * */

/**
 * @setting text p-element - The name of the HTML element. NOTE: Setting the name of the element to `remove` will remove the object.
 * */

exports.directive = function( node, parentList ){
	
	if( node.attr ){
		
		node.name = node.attr[ "p-element" ];
		
	}
	
};
