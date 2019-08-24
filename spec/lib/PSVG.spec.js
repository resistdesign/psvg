
var psvg = require( "../../lib/PSVG.js" );
var fs = require( "fs" );
var tU = require( "../TestUtils.js" );

// *** Setup ***

var testSrc = tU.testSrc;

// *** Helper Methods ***

describe( "lib/PSVG.js getUIDString", function(){
	
	it( "should return a string of random characters", function(){
		
		expect( psvg.getUIDString() ).not.toBeUndefined();
		
	} );
	
	it( "should be a unique string", function(){
		
		expect( psvg.getUIDString() ).not.toEqual( psvg.getUIDString() );
		
	} );
	
} );

describe( "lib/PSVG.js convertLabelCharacters", function(){

	var inputLabel = "test_x40_p-input_x3D__x22__x22__model_x3D__x22_model_x22__field_x3D__x22_test_x22_";
	var outputLabel = 'test@p-input="" model="model" field="test"';

	it( "should convert ASCII character representations such as _x42_ to standard characters", function(){
		
		expect( psvg.convertLabelCharacters( inputLabel ) ).toEqual( outputLabel );
		
	} );
	
} );

describe( "lib/PSVG.js getUserAttributes", function(){

	var inputLabel = "test_x40_p-input_x3D__x22__x22__model_x3D__x22_model_x22__field_x3D__x22_test_x22_";
	
	var inputJSON = JSON.stringify( psvg.getUserAttributes( inputLabel ) );
	var outputJSON = '{"id":"test","p-input":"","model":"model","field":"test"}';
	
	it( "should convert a label value to an attribute object", function(){
		
		expect( inputJSON ).toEqual( outputJSON );
		
	} );
	
} );

describe( "lib/PSVG.js mergeAttributes", function(){
	
	var inputJSON = JSON.stringify( psvg.mergeAttributes( {
		
		id: "test_x40_p-input_x3D__x22__x22__model_x3D__x22_model_x22__field_x3D__x22_test_x22_",
		x: 100,
		y: 100
		
	} ) );
	
	var outputJSON = '{"id":"test","x":100,"y":100,"p-input":"","model":"model","field":"test"}';
	
	it( "should convert an object id into additional attributes", function(){
		
		expect( inputJSON ).toEqual( outputJSON );
		
	} );
	
} );

describe( "lib/PSVG.js getCompilerDirectives", function(){
	
	var absSrc = fs.realpathSync( testSrc );
	
	var compDirs = psvg.getCompilerDirectives( absSrc );
	
	var pInputDirective = compDirs[ "p-input" ];
	
	var inputObj = {
		
		name: "node",
		
		attr: {}
		
	};
	
	// Run compiler directive.
	pInputDirective( inputObj );
	
	var inputJSON = JSON.stringify( inputObj );
	var outputJSON = '{"name":"node","attr":{"placeholder":"Test Label"}}';
	
	it( "should find and load all of the compiler directives in the target src folder", function(){
		
		expect( inputJSON ).toEqual( outputJSON );
		
	} );
	
} );

describe( "lib/PSVG.js convertObjectToXML", function(){
	
	it( "should convert the object and all of it's children to an xml string", function(){
		
		var nodeObj = {
			
			name: "node",
			
			attr: {
				
				id: "test"
				
			},
			
			children: [
				
				{
					
					name: "child",
					
					attr: {
						
						id: "test2"
						
					},
					
					val: "Test Text"
					
				}
				
			]
			
		};
		
		var xml = '<node id="test"><child id="test2">Test Text</child></node>';
		
		expect( psvg.convertObjectToXML( nodeObj ) ).toEqual( xml );
		
	} );
	
} );

// *** API Methods ***

describe( "lib/PSVG.js transformSVG", function(){
	
	var inputSVG = '<svg><rect id="test_x40_p-input_x3D__x22__x22_"></rect></svg>';
	var outputSVG = '<div overflow="hidden" p-layout-box="" style="position: absolute; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;" p-layout-container=""><div id="test" p-layout-box="" style="background-color: #000000; left: 0px; top: 0px; position: absolute; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;" fill="#000000" x="0" y="0" p-input="" placeholder="Test Label"></div></div>';
	
	it( "should transform the SVG and apply compiler directives", function(){
		
		expect( psvg.transformSVG( inputSVG, testSrc ) ).toEqual( outputSVG );
		
	} );
	
} );
