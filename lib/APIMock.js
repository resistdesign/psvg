
/**
 * A module for mocking API requests based on a the structure of a given API mock object.
 */

var HEADERS_NAME = "$headers";
var BODY_NAME = "$body";

var parseDotNotation = function( object, property, useLastFoundObject ){
	
	if( !object ) return object;
	if( !property ) return object;
	
	var propertyList = property.split( "." );
	
	var newObject = object[ propertyList.shift() ];
	var newProperty = propertyList.join( "." );
	
	var returnObject = parseDotNotation( newObject, newProperty, useLastFoundObject );
	
	return returnObject || !useLastFoundObject ? returnObject : object;
	
};

var getMethodMap = function( mockObject, method ){

	if( !mockObject || !method ) return undefined;

	return mockObject[ method.toLowerCase() ];
	
};

var getAPIObject = function( methodMap, path ){

	if( !methodMap || !path ) return undefined;
	
	var dotPath = path.split( "/" ).join( "." );
	
	return parseDotNotation( methodMap, dotPath, true );
	
};

module.exports = {
	
	getHeaders: function( mockObject, method, path ){
		
		var methodMap = getMethodMap( mockObject, method );

		if( !methodMap ) return undefined;
		
		var apiObject = getAPIObject( methodMap, path );
		
		if( !apiObject ) return undefined;
		
		var headers = apiObject[ HEADERS_NAME ];
		
		if( !headers ) headers = methodMap[ HEADERS_NAME ];
		
		return headers;
		
	},
	getBody: function( mockObject, method, path ){

		var methodMap = getMethodMap( mockObject, method );

		if( !methodMap ) return undefined;

		var apiObject = getAPIObject( methodMap, path );

		if( !apiObject ) return undefined;

		return apiObject[ BODY_NAME ];
		
	}
	
};
