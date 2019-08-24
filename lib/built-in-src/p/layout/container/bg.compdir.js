
/**
 * @info - Add this tag to a rectangle to apply it's styling to it's parent group. NOTE: The rectangle will be removed.
 * */

var toHTML = require( "../../../../html/NodeDirectives.js" );

exports.directive = function( node, parentList ){
	
	var parent = parentList[ parentList.length - 1 ];
	
	if( parent ){
		
		// Set node to be removed by the xml generation phase of the compiler.
		node.name = "remove";
		
		var nodeStyle = toHTML.getStyleObject( node.attr.style );
		var parentStyle = toHTML.getStyleObject( parent.attr.style );
		
		// Set CSS styles on parent.
		if( "undefined" !== typeof nodeStyle[ "background-color" ] ) parentStyle[ "background-color" ] = nodeStyle[ "background-color" ];
		
		if( "undefined" !== typeof nodeStyle[ "border-width" ] ){
			
			parentStyle[ "border-style" ] = nodeStyle[ "border-style" ];
			parentStyle[ "border-width" ] = nodeStyle[ "border-width" ];
			parentStyle[ "border-color" ] = nodeStyle[ "border-color" ];

		}
		
		parent.attr.style = toHTML.getStyleString( parentStyle );
		
	}
	
};
