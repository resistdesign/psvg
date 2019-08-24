
/**
 * @info - Round all `(c)x(1,2)`, `(c)y(1,2)`, `width` and `height` pixel coordinates, on the target SVG object and all of it's descendant objects, to a whole number.
 * */

/**
 * @info - WORKS WITH: Rectangles, circle/ellipse centers and lines.
 * */

exports.directive = function( node, parentList ){
	
	var attrList = [
		
		"x",
		"x1",
		"x2",
		"cx",
		"y",
		"y1",
		"y2",
		"cy",
		"width",
		"height"
		
	];
	
	var roundAttr = function( node, attrName ){
		
		if( node && node.attr ){
			
			var val = parseFloat( node.attr[ attrName ] );
			
			if( !isNaN( val ) ){
				
				node.attr[ attrName ] = Math.round( val );
				
			}
			
		}
		
	};
	
	var roundIt = function( node ){
		
		if( node ){
			
			if( node.attr ){
				
				for( var k in attrList ){

					roundAttr( node, attrList[ k ] );

				}
				
			}
			
			if( node.children ){
				
				for( var j in node.children ){
					
					roundIt( node.children[ j ] );
					
				}
				
			}
			
		}
		
	};
	
	roundIt( node );
	
};
