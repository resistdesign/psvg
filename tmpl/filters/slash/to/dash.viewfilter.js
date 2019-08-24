
var pathUtils = require( "path" );
var jsu = require( "../../../../lib/JSUtils.js" );

exports.filter = function( data ){
	
	if( !jsu.isType( data, "string" ) ) return data;
	
	return data.split( pathUtils.sep).join( "-" );
	
};
