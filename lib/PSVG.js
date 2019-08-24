
/**
 * @info - The Parasol SVG compiler.
 * */

// *** Imports ***

var pathUtils = require( "path" );
var wrench = require( "wrench" );
var xmldoc = require( "xmldoc" );
var fs = require( "fs" );
var jsu = require( "./JSUtils.js" );
var toHTML = require( "./html/NodeDirectives.js" );

module.exports = {

	// *** Properties ***
	
	/**
	 * @var string compilerDirectiveExt - The file extension for compiler directives.
	 * */
	compilerDirectiveExt: "compdir.js",
	
	// *** Helper Methods ***

	getUIDString: function(){

		return Math.random().toString(36).substr(2)
			+ Math.random().toString(36).substr(2)
			+ Math.random().toString(36).substr(2)
			+ Math.random().toString(36).substr(2);

	},

	convertLabelCharacters: function( labelString ){

		var newLabel = labelString;

		var reg = "_x[^_][0-9a-zA-z]_";
		var regex = new RegExp( reg, "g" );
		var chars = labelString.match( regex );

		var underscorePlaceholder = "<<<***" + module.exports.getUIDString() + "***>>>";

		for( var l in chars ){

			var currChar = chars[ l ];
			var currCharCode = "0" + currChar.split( "_" ).join( "" );

			var newChar = String.fromCharCode( Number( currCharCode ) );

			// TRICKY: Be careful with underscores, spaces must be inserted first.
			if( newChar == "_" ){

				newChar = underscorePlaceholder;

			}

			newLabel = newLabel.replace( currChar, newChar );

		}

		// TRICKY: Replace underscores with spaces.
		newLabel = newLabel.split( "_" ).join( " " );

		// TRICKY: Now replace the underscores.
		newLabel = newLabel.split( underscorePlaceholder ).join( "_" );

		return newLabel;

	},

	getUserAttributes: function( labelString, extendedAttributes ){

		var userAttrs = {};

		var delimiterIndex = -1;
		
		var labelStringDefined = "string" === typeof labelString && labelString !== "";
		
		if( labelStringDefined ){
			
			labelString = module.exports.convertLabelCharacters( labelString );

			delimiterIndex = labelString.indexOf( "@" );

		}

		if( delimiterIndex !== -1 ){

			var realID = labelString.substr( 0, delimiterIndex );
			
			var attrString = labelString.substr( delimiterIndex + 1, labelString.length );

			var tempNode = '<node id="' + realID + '" ' + attrString + ' />';

			// TRICKY: Parse attributes correctly.
			var doc = new xmldoc.XmlDocument( tempNode );

			if( doc.attr ){

				userAttrs = doc.attr;
				
			}else{
				
				console.warn( "WARNING: Cannot parse user attributes from label: " + labelString );
				
			}

		}else{

			if( labelStringDefined ) userAttrs.id = labelString;

		}

		// TRICKY: Don't leave spaces in the id.
		if( "string" === typeof userAttrs.id && userAttrs.id !== "" ){

			userAttrs.id = String( userAttrs.id ).split( " " ).join( "_" );
			
			// IMPORTANT: Apply extended attributes.
			if( extendedAttributes && extendedAttributes[ userAttrs.id ] ){
				
				var extAttrs = extendedAttributes[ userAttrs.id ];
				
				for( var k in extAttrs ){
					
					userAttrs[ k ] = extAttrs[ k ];
					
				}
				
			}
			
		}
		
		return userAttrs;
		
	},
	
	pPrefix: "p-",
	layoutAttrs: {
		
		"x": 1,
		"y": 1,
		"r": 1,
		"b": 1,
		"width": 1,
		"height": 1
		
	},
	
	mergeAttributes: function( xmldocObjectAttributes, extendedAttributes ){
		
		if( xmldocObjectAttributes ){

			var userAttrs = module.exports.getUserAttributes( xmldocObjectAttributes.id, extendedAttributes );
			
			var prefix = module.exports.pPrefix;
			var preLen = prefix.length;
			
			var userLayoutAttrs = {};
			var layoutAttrs = module.exports.layoutAttrs;
			
			for( var k in userAttrs ){
				
				var realAttr = k;
				var value = userAttrs[ k ];
				
				if( realAttr.indexOf( prefix ) === 0 ){

					realAttr = realAttr.substr( preLen, realAttr.length );
					
				}

				if( layoutAttrs[ realAttr ] ){

					userLayoutAttrs[ realAttr ] = value;

					xmldocObjectAttributes[ realAttr ] = value;
					
				}else{

					xmldocObjectAttributes[ k ] = value;
					
				}
				
			}

			// TRICKY: IMPORTANT: Correct size/position settings based on User defined coordinates. ex: Don't set `width` if `x` and `r` are set.
			if( "undefined" !== typeof userLayoutAttrs.r ){
				
				if( "undefined" === typeof userLayoutAttrs.x ){
					
					delete xmldocObjectAttributes.x;
					
				}else if( "undefined" !== typeof xmldocObjectAttributes.width ){

					delete xmldocObjectAttributes.width;
					
				}
				
			}

			if( "undefined" !== typeof userLayoutAttrs.b ){

				if( "undefined" === typeof userLayoutAttrs.y ){

					delete xmldocObjectAttributes.y;

				}else if( "undefined" !== typeof xmldocObjectAttributes.height ){

					delete xmldocObjectAttributes.height;

				}

			}
			
		}

		return xmldocObjectAttributes;

	},
	
	mergeDocAttributes: function( docObj, extendedAttributes ){

		docObj.attr = module.exports.mergeAttributes( docObj.attr, extendedAttributes );
		
		// *** Rectangle Fill Fix ***
		if( docObj && docObj.name == "rect" && docObj.attr && "undefined" == typeof docObj.attr.fill ){

			docObj.attr.fill = "#000000";
			
		}
		
		if( docObj.children ){
			
			for( var i = 0; i < docObj.children.length; i++ ){
				
				var docChild = docObj.children[ i ];
				
				module.exports.mergeDocAttributes( docChild, extendedAttributes );
				
			}
			
		}

	},
	
	removeEditingRelatedElements: function( svgNode, parentNode ){
		
		// TRICKY: Process children first in case of removals.
		
		if( svgNode.children ){

			for( var k in svgNode.children ){

				module.exports.removeEditingRelatedElements( svgNode.children[ k ], svgNode );

			}

		}

		// TRICKY: Remove Illustrator related editing info.

		if( svgNode.name === "switch" || svgNode.attr && ( svgNode.attr[ "i:extraneous" ] === "self" || svgNode.attr[ "requiredExtensions" ] === "&ns_ai;" ) )
		{
			
			if( parentNode && svgNode.children ){
				
				if( svgNode.children ){
					
					var svgNodeChildrenRev = svgNode.children.reverse();
					
					for( var j in svgNodeChildrenRev ){

						parentNode.children.splice( parentNode.children.indexOf( svgNode ), 0, svgNodeChildrenRev[ j ] );
						
					}
					
				}

				parentNode.children.splice( parentNode.children.indexOf( svgNode ), 1 );
				
			}
			
		}
		
	},
	
	svgImageTag: "svg-image",
	
	convertToHTML: function( node, parentList, extendedAttributes ){
		
		// IMPORTANT: Check to see if the node should have it's SVG bounds set.
		if( node.attr && node.attr.id ){

			var userAttrs = module.exports.getUserAttributes( node.attr.id, extendedAttributes );
			
			if( userAttrs ){

				if( "undefined" !== typeof userAttrs[ module.exports.svgImageTag ] ){
					
					toHTML.setSVGBounds( node );
					
					// IMPORTANT: Do NOT process.
					return;
					
				}
				
			}
			
		}
		
		// Initialize the parent list if it is not set.
		if( !parentList ) parentList = [];

		// IMPORTANT: Convert children first so that positions can be accurately reset.
		if( jsu.isArray( node.children ) && node.children.length > 0 ){

			for( var i = 0; i < node.children.length; i++ ){

				var nextParentList = parentList.concat( node );

				module.exports.convertToHTML( node.children[ i ], nextParentList, extendedAttributes );

			}

		}

		toHTML.convertNodeToHTML( node, parentList );
		
	},
	
	convertCoordinatesToStyles: function( node ){

		if( jsu.isArray( node.children ) && node.children.length > 0 ){

			for( var i = 0; i < node.children.length; i++ ){
				
				module.exports.convertCoordinatesToStyles( node.children[ i ] );

			}

		}
		
		toHTML.convertCoordinatesToStyles( node );
		
	},
	
	runCompilerDirectives: function( elementObject, compilerDirectiveMaps, parentList ){

		if( elementObject ){
			
			if( "undefined" == typeof parentList ) parentList = [];
			
			if( "object" == typeof elementObject.attr ){

				// TRICKY: Run compiler directives first as they may remove children.
				
				if( "object" == typeof elementObject.attr && jsu.isArray( compilerDirectiveMaps ) ){
					
					for( var c = 0; c < compilerDirectiveMaps.length; c++ ){
						
						var compilerDirectiveMap = compilerDirectiveMaps[ c ];

						if( "object" == typeof compilerDirectiveMap ){

							for( var a in elementObject.attr ){
								
								if( "function" == typeof compilerDirectiveMap[ a ] ){

									var comDirFunc = compilerDirectiveMap[ a ];

									comDirFunc( elementObject, parentList );

								}

							}

						}
						
					}
					
				}
				
			}
			
			// TRICKY: If the recompile flag is set on the elementObject send it through `runCompilerDirectives` again.
			if( elementObject.recompile ){

				elementObject.recompile = false;

				module.exports.runCompilerDirectives( elementObject, compilerDirectiveMaps, parentList );
				
				return elementObject;
				
			}
			
			// TRICKY: Run compiler directives on child nodes after running compiler directives on the current node.
			if( elementObject.children && elementObject.children.length > 0 ){
				
				var nextParentList = parentList.concat( elementObject );
				
				for( var i = 0; i < elementObject.children.length; i++ ){

					var currChild = elementObject.children[ i ];

					module.exports.runCompilerDirectives( currChild, compilerDirectiveMaps, nextParentList );

				}

			}

			// TRICKY: If the recompile flag is set on the elementObject send it through `runCompilerDirectives` again.
			if( elementObject.recompile ){

				elementObject.recompile = false;

				module.exports.runCompilerDirectives( elementObject, compilerDirectiveMaps, parentList );

				return elementObject;

			}

		}

		return elementObject;

	},
	
	skipNodes: {
		
		"foreignObject": 1,
		"i:pgf": 1,
		"remove": 1
		
	},
	
	convertObjectToXML: function( object ){

		var nodeString = "";
		
		if( object ){
			
			// IMPORTANT: Remove Adobe Illustrator Editing Info.
			if( module.exports.skipNodes[ object.name ] ) return nodeString;
			
			nodeString = '<' + object.name;

			var attrString = '';

			if( object.attr ){

				for( var k in object.attr ){

					attrString += ' ' + k + '="' + object.attr[ k ] + '"';

				}

			}

			nodeString += attrString + '>';

			if( !jsu.isArray( object.children ) || object.children.length < 1 ){

				nodeString += "undefined" != typeof object.val ? object.val : "";

			}else{

				for( var i = 0; i < object.children.length; i++ ){

					var currChild = object.children[ i ];

					nodeString += module.exports.convertObjectToXML( currChild );

				}

			}

			nodeString += '</' + object.name + '>';

		}

		return nodeString;

	},
	
	uncacheCompilerDirective: function( name ){
		
		jsu.uncacheModule( name );
		
	},
	
	// *** API Methods ***

	getCompilerDirectives: function( absoluteSrcPath ){

		var dirList = wrench.readdirSyncRecursive( absoluteSrcPath );

		var compilerDirectives = {};

		for( var i = 0; i < dirList.length; i++ ){

			var currFile = dirList[ i ];

			if( currFile ){

				var comDirExt = "." + module.exports.compilerDirectiveExt;

				var comDirExtIndex = currFile.indexOf( comDirExt );

				var comDirNameLength = currFile.length - comDirExt.length;

				if( comDirExtIndex !== -1 && comDirExtIndex == comDirNameLength ){

					var comDirName = currFile.substr( 0, comDirNameLength );
					comDirName = comDirName.split( pathUtils.sep ).join( "-" );

					if( !compilerDirectives[ comDirName ] ){

						var fullComDirPath = absoluteSrcPath + pathUtils.sep + currFile;

						// IMPORTANT: Uncache the compiler directive module so that any new functionality will be live.
						module.exports.uncacheCompilerDirective( fullComDirPath );
						
						var comDirFunc = require( fullComDirPath );
						
						compilerDirectives[ comDirName ] = comDirFunc.directive;

					}

				}

			}

		}

		return compilerDirectives;

	},

	transformSVG: function( svgString, projectSrc, compilerDirectivesList, isApp, extendedAttributes ){

		if( !svgString ) return svgString;
		
		var compilerDirectives = {};
		
		if( !jsu.isArray( compilerDirectivesList ) ) compilerDirectivesList = [];
		
		if( projectSrc && compilerDirectivesList.length < 1 ){

			var fullSrcPath = fs.realpathSync( projectSrc );

			compilerDirectives = module.exports.getCompilerDirectives( fullSrcPath );

			compilerDirectivesList.push( compilerDirectives );
			
		}

		var svgDoc = new xmldoc.XmlDocument( svgString );
		
		
		if( jsu.isType( svgDoc, "object" ) && jsu.isType( svgDoc.attr, "object" ) ){
			
			// IMPORTANT: Prepare for display.
			
			// Hide the overflow.
			svgDoc.attr.overflow = "hidden";
			
			// Remove coordinate attributes.
			try{
				
				delete svgDoc.attr.x;
				delete svgDoc.attr.y;
				delete svgDoc.attr.width;
				delete svgDoc.attr.height;
				
				// TRICKY: Don't use view port related attributes or undesired scaling will occur with nested SVG elements.
				delete svgDoc.attr[ "viewBox" ];
				delete svgDoc.attr[ "enable-background" ];
				
			}catch( error ){
				
				// Ignore.
				
			}
			
		}
		
		// Remove editing info.
		module.exports.removeEditingRelatedElements( svgDoc );
		
		// Convert all nodes to HTML.
		module.exports.convertToHTML( svgDoc, undefined, extendedAttributes );
		
		// Merge all user set attributes with existing node attributes.
		module.exports.mergeDocAttributes( svgDoc, extendedAttributes );
		
		// Convert coordinate attributes to styles.
		module.exports.convertCoordinatesToStyles( svgDoc );
		
		// Run all compiler directives.
		svgDoc = module.exports.runCompilerDirectives( svgDoc, compilerDirectivesList );
		
		// Convert to XML String.
		return module.exports.convertObjectToXML( svgDoc );
		
	}
	
};
