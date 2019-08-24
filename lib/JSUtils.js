
/**
 * @info - Tools for basic JavaScript operations.
 * */

// *** Imports ***

var pathUtils = require( "path" );

module.exports = {
	
	// *** API Methods ***

	isType: function( value, type ){

		return type == typeof value;

	},
	
	isUndefined: function( value ){

		if( !module.exports.isType( value, "undefined" ) ) return false;

		return true;

	},
	
	isArray: function( value ){

		if( Object.prototype.toString.call( value ) === "[object Array]" ){

			return true;

		}

		return false;
		
	},
	
	verifyObjectWithProperties: function( object, properties, anyProperty ){
		
		if( !module.exports.isType( object, "object" ) ) return false;
		
		if( module.exports.isArray( properties ) ){
			
			for( var i = 0; i < properties.length; i++ ){
				
				var currProp = properties[ i ];
				
				if( anyProperty ){

					if( !module.exports.isUndefined( object[ currProp ] ) ) return true;
					
				}
				
				if( module.exports.isUndefined( object[ currProp ] ) ) return false;
				
			}
			
		}
		
		return true;
		
	},
	
	getFullFileExt: function( filePath ){
		
		if( !filePath ) return filePath;

		var filePathParts = filePath.split( pathUtils.sep );
		var fileName = filePathParts.pop();
		
		var fileNameParts = fileName.split( "." );
		
		if( fileNameParts.length > 0 ) fileNameParts.shift();
		
		var ext = fileNameParts.join( "." );
		
		return ext;
		
	},
	
	uncacheModule: function( fullPath ){

		try{

			var modulePath = require.resolve( fullPath );

			if( !module.exports.isUndefined( modulePath ) ){

				if( !module.exports.isUndefined( require.cache[ modulePath ] ) ){

					delete require.cache[ modulePath ];

				}

			}

		}catch( error ){

			// Ignore.

		}
		
	}
	
};
