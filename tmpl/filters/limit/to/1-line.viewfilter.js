
var jsu = require( "../../../../lib/JSUtils.js" );

exports.filter = function( data ){

	if( !jsu.isType( data, "string" ) ) return data;
	
	var lineBreakIndex = data.indexOf( "\n" );
	
	if( lineBreakIndex !== -1 ){

		data = data.substr( 0, lineBreakIndex );
		
	}
	
	return data;

};
