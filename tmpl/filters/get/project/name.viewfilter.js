
var fs = require( "fs" );

exports.filter = function( data ){
	
	try{
		var projectName = JSON.parse( fs.readFileSync( "package.json", "utf8" ) ).name;
		
		return "string" === typeof projectName ? projectName + " " : "";
		
	}catch( projectNameError ){
		
		// Ignore.
		
	}
	
	return "";
	
};
