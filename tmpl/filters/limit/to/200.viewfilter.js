
var jsu = require( "../../../../lib/JSUtils.js" );

exports.filter = function( data ){
	
	if( !jsu.isType( data, "string" ) ) return data;
	
	if( data.length <= 200 ){
		
		return data;
		
	}
	
	return data.substr( 0, 200 ) + "...";
	
};
