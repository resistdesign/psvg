
/**
 * @info - Convert a group of objects into an SVG image for use in HTML.
 * > IMPORTANT: All text must be converted to paths in order to accurately size and position the SVG image.
 * */

var toHTML = require( "../../html/NodeDirectives.js" );

exports.directive = function( node, parentList ){

	if( node.svgImgCompiled ) return;
	
	var groupNode = {
		
		name: "g",
		attr: {},
		children: node.children
		
	};
	
	var svgNode = {
		
		name: "svg",
		attr: {

			"xmlns": "http://www.w3.org/2000/svg",
			"xmlns:xlink": "http://www.w3.org/1999/xlink",
			"overflow": "visible"
			
		},
		children: [ groupNode ]
		
	};
	
	node.children = [ svgNode ];
	
	// TRICKY: Run the node through the rect directive to convert the size and position attributes.
	toHTML.directives.rect( node, parentList, true, true );
	
	node.name = "div";
	
	// Add the `p-layout-box` tag.
	node.attr[ "p-layout-box" ] = "";
	
	// TRICKY: Mark the node as recompilation given the change in child order.
	node.svgImgCompiled = true;
	node.recompile = true;
	
};
