
var pathutils = require( "path" );
var fs = require( "fs" );
var dep = require( "../../lib/Deploy.js" );
var tU = require( "../TestUtils.js" );

// *** Setup ***

var config = tU.deployConfig;

var projectRoot = tU.projectRoot;
var publicRoot = tU.publicRoot;
var publicAssets = tU.publicAssets;

var publicAngularAsset = publicAssets + pathutils.sep + "js" + pathutils.sep + "angular.min.js";

var publicProjectTestFile = publicRoot + pathutils.sep + "testSVG.svg";

var publicProjectTestIgnoreFile = publicRoot + pathutils.sep + "test.compdir.js";

var publicProjectLessCSSFile = publicAssets + pathutils.sep + "css" + pathutils.sep + "test-less.css";
var publicProjectTestJSFile = publicRoot + pathutils.sep + "test-src.min.js";

describe( "lib/Deploy.js verifyConfig", function(){
	
	it( "should return false when given an invalid configuration", function(){
		
		expect( dep.verifyConfig() ).toEqual( false );
		
	} );
	
	it( "should return true when given a valid configuration", function(){
		
		expect( dep.verifyConfig( config, projectRoot ) ).toEqual( true );
		
	} );
	
} );

describe( "lib/Deploy.js deploy", function(){
	
	beforeEach( function(){
		
		tU.createProjectFolder();
		
	} );
	
	afterEach( function(){
		
		tU.removeProjectFolder();
		
	} );

	it( "should return false when given an invalid configuration", function(){

		var deployed = dep.deploy();

		expect( deployed ).toEqual( false );
		
	} );
	
	it( "should return true when given a valid configuration", function(){

		var deployed = dep.deploy( config, projectRoot );
		
		expect( deployed ).toEqual( true );
		
	} );
	
	it( "should deploy built-in assets to the 'public' assets folder", function(){

		dep.deploy( config, projectRoot );
		
		var angularExists = fs.existsSync( publicAngularAsset );
		
		expect( angularExists ).toEqual( true );
		
	} );
	
	it( "should deploy project files to the 'public' folder", function(){

		dep.deploy( config, projectRoot );
		
		var testFileExists = fs.existsSync( publicProjectTestFile );
		
		expect( testFileExists ).toEqual( true );
		
	} );
	
	it( "should not copy ignored files", function(){

		dep.deploy( config, projectRoot );

		var testFileExists = fs.existsSync( publicProjectTestIgnoreFile );

		expect( testFileExists ).toEqual( false );
		
	} );
	
	it( "should convert less to css", function(){

		dep.deploy( config, projectRoot );
		
		var cssContent = fs.readFileSync( publicProjectLessCSSFile, "utf8" );
		
		var converted = cssContent.indexOf( ".test-class .test-sub-class" ) !== -1;
		
		expect( converted ).toEqual( true );
		
	} );
	
	it( "should minify js files", function(){

		dep.deploy( config, projectRoot );

		var jsContent = fs.readFileSync( publicProjectTestJSFile, "utf8" );
		
		var converted = jsContent.indexOf( "message" ) === -1;

		expect( converted ).toEqual( true );
		
	} );
	
} );
