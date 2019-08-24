
var jsu = require( "../../../lib/JSUtils.js" );

exports.filter = function( data ){
	
	if( !data ) return data;
	
	if( jsu.isArray( data.name ) && jsu.isType( data.name[ 0 ], "object" ) && !jsu.isUndefined( data.name[ 0 ].line ) ) return data.name[ 0 ].line;
	
	return data.__FILE_NAME__;
	
};
