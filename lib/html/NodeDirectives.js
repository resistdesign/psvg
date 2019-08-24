
/**
 * Convert various SVG node types to HTML nodes.
 * */

var jsu = require( "../JSUtils.js" );
var raphael = require( "raphael-browserify" );

exports.cssAdditions = {
	
	"box-sizing": [
		
		"-webkit-box-sizing",
		"-moz-box-sizing",
		"box-sizing"
		
	]
	
};

exports.getStyleObject = function( styleString ){
	
	var style = {};
	
	if( "undefined" === typeof styleString ) styleString = "";
	
	var styleProps = styleString.split( ";" );
	
	for( var i = 0; i < styleProps.length; i++ ){
		
		var prop = styleProps[ i ];
		
		if( "undefined" === typeof prop || prop === "" ) continue;
		
		var propParts = prop.split( ":" );
		
		var name = propParts[ 0 ];
		var value = propParts[ 1 ];
		
		if( name ){
			
			// CLean up.
			if( name.indexOf( " " ) === 0 ) name = name.substr( 1, name.length );
			if( name.indexOf( " " ) === name.length - 1 ) name = name.substr( 0, name.length - 1 );
			if( value && value.indexOf( " " ) === 0 ) value = value.substr( 1, value.length );
			
			style[ name ] = value;
			
		}
		
	}
	
	return style;
	
};

exports.getStyleString = function( styleObject ){
	
	var styleList = [];
	
	for( var k in styleObject ){
		
		if( exports.cssAdditions && exports.cssAdditions[ k ] ){
			
			var stylePropList = exports.cssAdditions[ k ];
			
			for( var i = 0; i < stylePropList.length; i++ ){
				
				var styleProp = stylePropList[ i ];

				var addStyleString = styleProp + ": " + styleObject[ k ] + ";";

				styleList.push( addStyleString );
				
			}
			
		}else{

			var styleString = k + ": " + styleObject[ k ] + ";";

			styleList.push( styleString );
			
		}
		
	}
	
	return styleList.join( " " );
	
};

exports.getPathDataFromPolyPoints = function( polyPoints, closed ){

	var points = polyPoints.split( /\s+|,/ );
	
	var x0 = points.shift();
	var y0 = points.shift();
	
	var pathData = "M" + x0 + "," + y0 + "L" + points.join( " " );
	
	if( closed ) pathData += "z";
	
	return pathData;
	
};

exports.setSVGBounds = function( node ){

	var addNode = function( node, paper ){

		paper = paper || raphael( 0, 0, 0, 0 );

		var typeProcessMap = {

			g: function( node, paper ){

				if( node.children ){

					for( var k in node.children ){

						addNode( node.children[ k ], paper );

					}

				}

			},
			circle: function( node, paper ){

				paper.circle( node.attr.cx, node.attr.cy, node.attr.r );

			},
			ellipse: function( node, paper ){

				paper.ellipse( node.attr.cx, node.attr.cy, node.attr.rx, node.attr.ry );

			},
			image: function( node, paper ){

				paper.rect( node.attr.x, node.attr.y, node.attr.width, node.attr.height );

			},
			path: function( node, paper ){

				paper.path( node.attr.d );

			},
			polyline: function( node, paper ){

				paper.path( exports.getPathDataFromPolyPoints( node.attr.points ) );
				
			},
			polygon: function( node, paper ){

				paper.path( exports.getPathDataFromPolyPoints( node.attr.points, true ) );

			},
			rect: function( node, paper ){

				paper.rect( node.attr.x, node.attr.y, node.attr.width, node.attr.height );

			},
			line: function( node, paper ){

				var linePath = "M" + node.attr.x1 + "," + node.attr.y1 + "L" + node.attr.x2 + "," + node.attr.y2;

				paper.path( linePath );

			}

		};

		if( "function" === typeof typeProcessMap[ node.name ] ){

			var processFunction = typeProcessMap[ node.name ];

			processFunction( node, paper );

		}

		return paper;

	};

	var svg = addNode( node );

	var bbox = {

		x: Infinity,
		y: Infinity,
		width: -Infinity,
		height: -Infinity

	};

	svg.forEach( function( el ){

		var bx = el.getBBox();

		if( !isNaN( bx.x ) ){

			bbox.x = Math.min( bbox.x, bx.x );

			if( !isNaN( bx.width ) ) bbox.width = Math.max( bbox.width, bx.x + bx.width );

		}

		if( !isNaN( bx.y ) ){

			bbox.y = Math.min( bbox.y, bx.y );

			if( !isNaN( bx.width ) ) bbox.height = Math.max( bbox.height, bx.y + bx.height );

		}

	} );

	bbox.width = bbox.width - bbox.x;
	bbox.height = bbox.height - bbox.y;
	
	node.attr.x = bbox.x;
	node.attr.y = bbox.y;
	node.attr.width = bbox.width;
	node.attr.height = bbox.height;
	
};

exports.directives = {
	
	switch: function( node, parentList ){
		
		var parent = parentList[ parentList.length - 1 ];
		
		if( parent && node.children && node.children.length > 0 ){

			// Move children to parent node.

			var children = parent.children ? parent.children : [];
			
			for( var j = 0; j < children.length; j++ ){
				
				if( children[ j ] === node ){
					
					children.splice( j, 1 );
					
					break;
					
				}
				
			}
			
			for( var i = 0; i < node.children.length; i++ ){
				
				children.push( node.children[ i ] );
				
			}
			
			parent.children = children;
			
		}else{
			
			// Convert to div.
			node.name = "div";

			// Run the node through the g directive.
			exports.directives.g( node, parentList );
			
		}
		
	},
	g: function( node, parentList, skipLayout ){
		
		// *** Apply Built-in AngularJS Directives ***
		
		node.name = "div";
		node.attr[ "p-layout-container" ] = "";

		// *** Set CSS Position Property ***

		var style = exports.getStyleObject( node.attr.style );
		style.position = "absolute";
		node.attr.style = exports.getStyleString( style );

		if( skipLayout || !node.children || node.children.length == 0 ) return;
		
		// *** Automatically Create Containers And Reset Child Coordinates ***
		
		var minX = Infinity;
		var minY = Infinity;
		
		var maxX = 0;
		var maxY = 0;
		
		for( var i = 0; i < node.children.length; i++ ){

			var child = node.children[ i ];
			
			var x = parseFloat( child.attr.x );
			var y = parseFloat( child.attr.y );
			var width = parseFloat( child.attr.width );
			var height = parseFloat( child.attr.height );
			
			if( !isNaN( x ) ){

				minX = Math.min( minX, x );
				if( !isNaN( width ) ) maxX = Math.max( maxX, x + width );
				
			}
			
			if( !isNaN( y ) ){

				minY = Math.min( minY, y );
				if( !isNaN( height ) ) maxY = Math.max( maxY, y + height );
				
			}
			
		}
		
		node.attr.x = minX;
		node.attr.y = minY;
		node.attr.width = maxX - minX;
		node.attr.height = maxY - minY;
		
		// IMPORTANT: Reset the position of each child.
		for( var j = 0; j < node.children.length; j++ ){
			
			var posChild = node.children[ j ];
			
			var x2 = parseFloat( posChild.attr.x );
			var y2 = parseFloat( posChild.attr.y );
			
			if( !isNaN( x2 ) ) posChild.attr.x = x2 - minX;
			if( !isNaN( y2 ) ) posChild.attr.y = y2 - minY;
			
		}
		
	},
	rect: function( node, parentList, skipFixFill, skipPositionFix ){
		
		node.name = "div";
		
		if( node.attr ){

			// IMPORTANT: Do not allow negative width or height.

			var x = parseFloat( node.attr.x );
			var y = parseFloat( node.attr.y );
			var width = parseFloat( node.attr.width );
			var height = parseFloat( node.attr.height );

			if( !isNaN( x ) && !isNaN( width ) ){

				x = width < 0 ? x + width : x;

				width = Math.abs( width );

				node.attr.x = x;

				node.attr.width = width;

			}

			if( !isNaN( y ) && !isNaN( height ) ){

				y = height < 0 ? y + height : y;

				height = Math.abs( height );

				node.attr.y = y;

				node.attr.height = height;

			}

			// Fix fill.
			if( !skipFixFill && "undefined" === typeof node.attr.fill ) node.attr.fill = "#000000";
			
			if( !skipPositionFix ){

				// Fix x and y.
				if( jsu.isUndefined( node.attr.x ) ) node.attr.x = 0;
				if( jsu.isUndefined( node.attr.y ) ) node.attr.y = 0;
				
			}
			
			// Convert attrs to CSS.

			// Get the style object.
			var style = exports.getStyleObject( node.attr.style );
			
			// Set styles.
			if( !jsu.isUndefined( node.attr.fill ) ) style[ "background-color" ] = node.attr.fill;
			
			// TRICKY: SVG sucks with strokes.
			if( !jsu.isUndefined( node.attr[ "stroke" ] ) && jsu.isUndefined( node.attr[ "stroke-width" ] ) ) node.attr[ "stroke-width" ] = "1";
			
			if( !jsu.isUndefined( node.attr[ "stroke" ] ) ){
				
				style[ "border-style" ] = "solid";
				style[ "border-width" ] = node.attr[ "stroke-width" ] + "px";
				style[ "border-color" ] = node.attr[ "stroke" ];
				
			}
			
			node.attr.style = exports.getStyleString( style );
			
		}
		
	},
	text: function( node, parentList ){
		
		if( node.attr ){
			
			// Convert transform to attrs.
			var tansAttrParts = node.attr.transform.split( " " );
			node.attr.y = tansAttrParts.pop().split( ")" ).join( "" );
			node.attr.x = tansAttrParts.pop();
			
			var fontSize = 0;
			var fontColor = "";
			var fontFamily = "";
			
			if( node.children && node.children.length > 0 ){
				
				// Get values and text from children.
				
				var childVals = [];
				
				for( var i = 0; i < node.children.length; i++ ){
					
					var childNode = node.children[ i ];
					
					if( i === 0 ){

						fontSize = parseFloat( childNode.attr[ "font-size" ] );
						fontColor = childNode.attr.fill;
						fontFamily = childNode.attr[ "font-family" ];
						
					}
					
					childVals.push( childNode.val );
					
				}
				
				node.val = childVals.join( "" );
				
				delete node.children;
				
			}else{
				
				// Get values and text directly.
				
				fontSize = parseFloat( node.attr[ "font-size" ] );
				fontColor = node.attr.fill;
				fontFamily = node.attr[ "font-family" ];
				
			}
			
			// Set style.
			var style = exports.getStyleObject( node.attr.style );
			
			style[ "font-size" ] = fontSize + "px";
			style.color = "undefined" === typeof fontColor || fontColor === "" ? "#000000" : fontColor;
			style[ "font-family" ] = fontFamily;
			
			node.attr.style = exports.getStyleString( style );

			// Move up by 0.75 font-size.
			node.attr.y = parseFloat( node.attr.y ) - ( parseFloat( fontSize ) * 0.75 );
			
			// Convert to a div.
			node.name = "div";
			
		}
		
	},
	line: function( node, parentList ){
		
		if( node.attr ){

			/*
			 Convert a line node like this `<line fill="none" stroke="#1C68A0" stroke-width="5" stroke-miterlimit="10" x1="225" y1="321" x2="397" y2="321"></line>`
			 to a rect node ONLY if it is either vertical or horizontal.
			 */
			
			var isVertical = node.attr.x1 === node.attr.x2;
			var isHorizontal = node.attr.y1 === node.attr.y2;

			if( "undefined" === typeof node.attr[ "stroke-width" ] ) node.attr[ "stroke-width" ] = 1;

			if( isVertical ){

				node.attr.x = node.attr.x1;
				node.attr.y = node.attr.y1;
				node.attr.width = node.attr[ "stroke-width" ];
				node.attr.height = parseFloat( node.attr.y2 ) - parseFloat( node.attr.y1 );
				
			}else if( isHorizontal ){

				node.attr.x = node.attr.x1;
				node.attr.y = node.attr.y1;
				node.attr.width = parseFloat( node.attr.x2 ) - parseFloat( node.attr.x1 );
				node.attr.height = node.attr[ "stroke-width" ];
				
			}else{
				
				// Leave the line as an SVG graphic.
				
				return;
				
			}

			node.name = "div";
			
			// Set the fill.
			node.attr.fill = node.attr.stroke;
			
			// TRICKY: Remove `stroke` & `stroke-width` before processing as a rect.
			delete node.attr[ "stroke" ];
			delete node.attr[ "stroke-width" ];
			
			// Run the new rect through the rect directive.
			exports.directives.rect( node, parentList );

		}

	},
	svg: function( node, parentList ){

		// Remove all xmlns attrs.
		for( var k in node.attr ){

			if( k.indexOf( "xmlns" ) === 0 ) delete node.attr[ k ];

		}

		// Convert to rect.
		node.name = "div";
		
		// Run the node through the g directive.
		exports.directives.g( node, parentList, true );

	}
	
};

exports.isSupported = function( type ){
	
	if( "string" !== typeof type ) type = "";
	
	return "function" === typeof exports.directives[ String( type ).toLowerCase() ];
	
};

exports.convertNodeToHTML = function( node, parentList ){
	
	if( exports.isSupported( node.name ) ){
		
		// IMPORTANT: Add the p-layout-box attribute.
		node.attr[ "p-layout-box" ] = "";

		var style = exports.getStyleObject( node.attr.style );

		// IMPORTANT: Convert `display` to a style.
		if( node.attr.display === "none" ){
			
			style.display = "none";
			
		}

		// Set opacity.
		if( !jsu.isUndefined( node.attr.opacity ) ) style.opacity = node.attr.opacity;

		node.attr.style = exports.getStyleString( style );

		exports.directives[ String( node.name ).toLowerCase() ]( node, parentList );
		
	}
	
};

exports.isPercentage = function( value ){
	
	return "string" === typeof value && value !== "" && value.indexOf( "%" ) === value.length - 1;
	
};

exports.isDynamicValue = function( value ){
	
	return isNaN( value ) && !exports.isPercentage( value );
	
};

exports.convertCoordinatesToStyles = function( node ){
	
	var pxPostfix = "px";
	
	if( !node.attr ) node.attr = {};
	
	// Get the style object.
	var style = exports.getStyleObject( node.attr.style );
	
	// Set position.
	if( !jsu.isUndefined( node.attr.x ) && !exports.isDynamicValue( node.attr.x ) ) style.left = node.attr.x + ( isNaN( node.attr.x ) ? "" : pxPostfix );
	if( !jsu.isUndefined( node.attr.y ) && !exports.isDynamicValue( node.attr.y ) ) style.top = node.attr.y + ( isNaN( node.attr.y ) ? "" : pxPostfix );
	if( !jsu.isUndefined( node.attr.r ) && !exports.isDynamicValue( node.attr.r ) ) style.right = node.attr.r + ( isNaN( node.attr.r ) ? "" : pxPostfix );
	if( !jsu.isUndefined( node.attr.b ) && !exports.isDynamicValue( node.attr.b ) ) style.bottom = node.attr.b + ( isNaN( node.attr.b ) ? "" : pxPostfix );

	// Set size. (Only if the rect is not being "pinned" on both sides.)
	if( !jsu.verifyObjectWithProperties( node.attr, [ "x", "r" ] ) && !jsu.isUndefined( node.attr.width ) && !exports.isDynamicValue( node.attr.width ) ){

		style.width = node.attr.width + ( isNaN( node.attr.width ) ? "" : pxPostfix );
		
	}
	
	if( !jsu.verifyObjectWithProperties( node.attr, [ "y", "b" ] ) && !jsu.isUndefined( node.attr.height && !exports.isDynamicValue( node.attr.height ) ) ){

		style.height = node.attr.height + ( isNaN( node.attr.height ) ? "" : pxPostfix );
		
	}

	if( jsu.verifyObjectWithProperties( node.attr, [ "x", "y", "r", "b" ], true ) ){

		// Set the `position` style.
		style.position = "absolute";

	}

	style[ "box-sizing" ] = "border-box";

	node.attr.style = exports.getStyleString( style );
	
};
