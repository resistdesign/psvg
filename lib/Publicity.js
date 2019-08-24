/** 
 * Publicity View Templating System for Node.js
 * */

GLOBAL.CodeString = function( code ){
	
	this.codeString = code;
	
};

var fs = require( "fs" );
var pathUtils = require( "path" );
var wrench = require( "wrench" );

exports.tagOpen = "${";
exports.tagClose = "}";
exports.tagDelimiter = ":";
exports.asCodeSymbol = "&";
exports.filterDelimiter = "#";
exports.filters = {};

exports.templateRoot = "./";

exports.viewExt = ".html";
exports.viewFilterExt = "viewfilter.js";

exports.__ZERO_BASED_INDEX__ = "__ZERO_BASED_INDEX__";
exports.__ONE_BASED_INDEX__ = "__ONE_BASED_INDEX__";

exports.buildViewList = function( data, viewPath, delimiter )
{
	
	var viewList = [];
	
	if( "undefined" == typeof( delimiter ) ) delimiter = "";
	delimiter = String( delimiter ).split( "\\n" ).join( "\n" );
	
	switch( typeof( data ) ){
	
	case "object":
		if( isArray( data ) ){
			
			for( var i = 0; i < data.length; i++ ){
				
				viewList.push( exports.buildSingleView( data[ i ], viewPath, i ) );
				
			}
			
		}else{
			
			for( var k in data ){
				
				viewList.push( exports.buildSingleView( data[ k ], viewPath, k ) );
				
			}
			
		}
		break;
	
	default:
		viewList.push( exports.buildSingleView( data, viewPath, 0 ) );
		break;
	
	}
	
	return viewList.join( delimiter );
	
};

exports.buildSingleView = function( data, viewPath, index )
{
	
	var viewContent = exports.loadView( viewPath );
	
	return exports.buildSingleViewFromContent( data, viewContent, index );
	
};

exports.buildSingleViewFromContent = function( data, viewContent, index )
{
	
	var tagsInView = exports.getViewTags( viewContent );
	
	var processedTags = [];
	
	var newViewContent = "undefined" == typeof( viewContent ) ? "" : String( viewContent );
	
	for( var i = 0; i < tagsInView.length; i++ ){
		
		var currTag = tagsInView[ i ];
		
		if( processedTags.indexOf( currTag ) !== -1 ) continue;
		
		processedTags.push( currTag );
		
		var tagInfo = exports.getViewTagParts( currTag );
		
		var currValue = exports.getPropertyValue( data, tagInfo.name, index );
		
		var tagReplacement = "";
		
		if( "undefined" != typeof( currValue ) && currValue !== "" && "undefined" != typeof( tagInfo.path ) ){
			
			if( "undefined" != typeof( tagInfo.type ) && tagInfo.type != "one" ){
				
				var subViewDelimiter = tagInfo.type == "many" ? "" : tagInfo.type;
				
				tagReplacement = exports.buildViewList( currValue, tagInfo.path, subViewDelimiter );
				
			}else{
				
				tagReplacement = exports.buildSingleView( currValue, tagInfo.path, 0 );
				
			}
			
		}else{
			
			tagReplacement = String( currValue );
			
		}
		
		newViewContent = newViewContent.split( currTag ).join( tagReplacement );
		
	};
	
	return newViewContent;
	
};

exports.loadView = function( viewPath )
{
	
	var cwd = process.cwd();
	
	process.chdir( exports.templateRoot );
	
	var viewContent = fs.readFileSync( viewPath + exports.viewExt, { encoding: "utf8" } );
	
	process.chdir( cwd );
	
	return viewContent;
	
};

exports.getViewTagParts = function( viewTag )
{
	
	if( "string" != typeof( viewTag ) || viewTag == "" || viewTag.length <= exports.tagOpen.length + exports.tagClose.length ){
		
		return { name: "" };
		
	}
	
	var tagEnd = String( viewTag ).substr( exports.tagOpen.length, viewTag.length );
	var tagCore = String( tagEnd ).substr( 0, tagEnd.length - exports.tagClose.length );
	
	var tagParts = tagCore.split( exports.tagDelimiter );
	
	var tag = {};
	
	tag.name = tagParts[ 0 ];
	if( tagParts.length > 1 ) tag.path = tagParts[ 1 ];
	if( tagParts.length > 2 ) tag.type = tagParts[ 2 ];
	
	return tag;
	
};

exports.getViewTags = function( viewContent )
{
	
	if( "string" != typeof( viewContent ) ) return [];
	
	var regExString = exports.cleanForRegex( exports.tagOpen ) + ".*?" + exports.cleanForRegex( exports.tagClose );
	
	var regExPat = new RegExp( regExString, "gm" );
	
	var matches = viewContent.match( regExPat );
	
	return matches ? matches : [];
	
};

exports.cleanForRegex = function( data )
{
	
	return data.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/gm, "\\$&" );
	
};

exports.getPropertyValue = function( data, property, index )
{
	
	var asCode = false;
	
	if( "string" == typeof( exports.asCodeSymbol ) && "string" == typeof( property ) && property.length >= exports.asCodeSymbol.length && property.substr( 0, exports.asCodeSymbol.length ) == exports.asCodeSymbol ){
		
		asCode = true;
		
		property = property.substr( exports.asCodeSymbol.length, property.length - exports.asCodeSymbol.length );
		
	}
	
	// Get filters
	var filterList = property.split( exports.filterDelimiter );
	property = filterList.shift();
	
	if( "undefined" == typeof( property ) || property == "" ) return exports.processValue( data, asCode, filterList );

	if( property == exports.__ZERO_BASED_INDEX__ ) return exports.processValue( index, asCode, filterList );
	
	if( property == exports.__ONE_BASED_INDEX__ ){
		
		if( "number" == typeof( index ) ) return exports.processValue( index + 1, asCode, filterList );
		return exports.processValue( index, asCode, filterList );
		
	}
	
	var currObject = data;
	
	var propList = property.split( "." );
	
	while( propList.length > 0 ){
		
		var currProp = propList.shift();
		
		if( "undefined" == typeof( currObject[ currProp ] ) ) return "";
		
		currObject = currObject[ currProp ];
		
	}
	
	return exports.processValue( currObject, asCode, filterList );
	
};

exports.processValue = function( value, asCode, filterList )
{
	
	var newValue = "";
	
	var toJSONWhenCode = true;
	
	switch( typeof( value ) ){
	
	case "undefined":
		newValue = "";
		break;
	
	case "object":
		// Object or Array
		newValue = value;
		break;
	
	case "function":
		toJSONWhenCode = false;
		newValue = asCode ? value.toString() : value();
		break;
	
	case "string":
		newValue = value;
		break;
	
	case "number":
		newValue = value;
		break;
	
	case "boolean":
		newValue = value;
		break;
	
	default:
		newValue = String( value );
		break;
	
	}
	
	newValue = asCode && toJSONWhenCode ? exports.stringify( newValue ) : newValue;
	
	// Apply filters.
	if( "object" == typeof( exports.filters ) && isArray( filterList ) && filterList.length > 0 ){
		
		for( var i = 0; i < filterList.length; i++ ){
			
			var currFilterName = filterList[ i ];
			
			if( "function" == typeof( exports.filters[ currFilterName ] ) ){
				
				var currFilterFunc = exports.filters[ currFilterName ];
				
				newValue = currFilterFunc( newValue );
				
			}
			
		}
		
	}
	
	return newValue;
	
};

exports.stringify = function( value ){
	
	var valueType = typeof( value );
	
	var newValue = "";
	
	switch( valueType ){
		
		case "object":
		
		if( value instanceof CodeString ){
			
			newValue = value.codeString;
			
			break;
			
		}
		
		var items = [];
		
		if( isArray( value ) ){
			
			newValue += "[";
			
			for( var i = 0; i < value.length; i++ ){
				
				items.push( exports.stringify( value[ i ] ) );
				
			}
			
			newValue += items.join( "," );
			
			newValue += "]";
			
		}else{
			
			newValue += "{";
			
			for( var k in value ){
				
				items.push( JSON.stringify( k ) + ":" + exports.stringify( value[ k ] ) );
				
			}
			
			newValue += items.join( "," );
			
			newValue += "}";
			
		}
		break;
		
		case "function":
		newValue = value.toString();
		break;
		
		default:
		newValue = JSON.stringify( value );
		break;
		
	}
	
	return newValue
	
};

exports.getViewFilters = function( absoluteSrcPath ){

	var dirList = wrench.readdirSyncRecursive( absoluteSrcPath );

	var compilerDirectives = {};

	for( var i = 0; i < dirList.length; i++ ){

		var currFile = dirList[ i ];
		var currFullFile = absoluteSrcPath + pathUtils.sep + currFile;

		if( fs.statSync( currFullFile ).isDirectory() ) continue;

		if( currFile ){

			var comDirExt = "." + exports.viewFilterExt;

			var comDirExtIndex = currFile.indexOf( comDirExt );

			var comDirNameLength = currFile.length - comDirExt.length;

			if( comDirExtIndex !== -1 && comDirExtIndex == comDirNameLength ){

				var comDirName = currFile.substr( 0, comDirNameLength).split( pathUtils.sep ).join( "-" );

				if( !compilerDirectives[ comDirName ] ){

					var comDirFunc = require( absoluteSrcPath + pathUtils.sep + currFile );

					compilerDirectives[ comDirName ] = comDirFunc.filter;

				}

			}

		}

	}
	
	return compilerDirectives;

};

var isArray = function( object ){
	
	if( Object.prototype.toString.call( object ) === "[object Array]" ){
		
		return true;
		
	}
	
	return false;
	
};
