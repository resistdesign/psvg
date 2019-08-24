
var jsu = require( "../../../lib/JSUtils.js" );

exports.filter = function( data ){
	
	var count = 0;
	
	if( data ){
		
		for( var k in data ){
			
			count += 1;
			
		}
		
	}
	
	return count;
	
};
