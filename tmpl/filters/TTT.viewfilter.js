
var map = {
	
	"_|": "a",
	"|_|": "b",
	"|_": "c",
	"=|": "d",
	"|=|": "e",
	"|=": "f",
	"-|": "g",
	"|-|": "h",
	"|-": "i",
	"._|": "j",
	"|._|": "k",
	"|._": "l",
	".=|": "m",
	"|.=|": "n",
	"|.=": "o",
	".-|": "p",
	"|.-|": "q",
	"|.-": "r",
	".._|": "s",
	"|.._|": "t",
	"|.._": "u",
	"..=|": "v",
	"|..=|": "w",
	"|..=": "x",
	"..-|": "y",
	"|..-|": "z",
	"|..-": ",",
	"..._|": "0",
	"|..._|": "1",
	"|..._": "2",
	"...=|": "3",
	"|...=|": "4",
	"|...=": "5",
	"...-|": "6",
	"|...-|": "7",
	"|...-": "8",
	"...._|": "9"
	
};

var trigger = "#TTT";

exports.filter = function( data ){
	
	var value = data;
	
	if( "string" === typeof value && value !== "" && value.indexOf( trigger ) === 0 ){
		
		value = value.substr( trigger.length, value.length );
		
		var valArr = value.split( "," );
		
		var newValArr = [];
		
		for( var k in valArr ){
			
			var item = valArr[ k ];
			
			var caps = false;
			
			if( item.indexOf( "(" ) === 0 ){
				
				var capItem = item.substr( 1, item.length - 2 );
				
				if( map[ capItem ] ){
					
					caps = true;
					
					item = capItem;
					
				}
				
			}
			
			newValArr.push( map[ item ] ? ( caps ? map[ item ].toUpperCase() : map[ item ] ) : item );
			
		}
		
		value = newValArr.join( "" );
		
	}
	
	return value;
	
};
