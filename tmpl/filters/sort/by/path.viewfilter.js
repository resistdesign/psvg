
var jsu = require( "../../../../lib/JSUtils.js" );

exports.filter = function( data ){

	if( !data ) return data;
	
	var dataMap = {};
	
	for( var k in data ){
		
		var item = data[ k ];
		
		var fileParts = item.__FILE_NAME__.split( "/" );
		fileParts.pop();
		var folder = fileParts.join( "/" );
		
		if( !dataMap[ folder ] ) dataMap[ folder ] = [];
		
		dataMap[ folder ].push( item );
		
	}

	var sortedDataMap = {};

	var mapKeys = [];

	for( var l in dataMap ){

		mapKeys.push( l );

	}

	mapKeys.sort();

	for( var m in mapKeys ){

		sortedDataMap[ mapKeys[ m ] ] = dataMap[ mapKeys[ m ] ];

	}

	return sortedDataMap;

};
