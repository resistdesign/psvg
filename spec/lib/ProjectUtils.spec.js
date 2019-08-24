
var pru = require( "../../lib/ProjectUtils.js" );
var fs = require( "fs" );
var pathUtils = require( "path" );
var tU = require( "../TestUtils.js" );

// *** Setup ***

var projectRoot = tU.projectRoot;

// *** Helper Methods ***

describe( "lib/ProjectUtils.js mkdir", function(){
	
	beforeEach( function(){

		tU.createProjectFolder();
		
	} );
	
	afterEach( function(){
		
		tU.removeProjectFolder();
		
	} );
	
	var testFolder = "test-folder";
	
	it( "should create a folder in the supplied projectRoot folder", function(){

		pru.mkdir( projectRoot, testFolder );

		var created = fs.existsSync( projectRoot + pathUtils.sep + testFolder );

		expect( created ).toEqual( true );
		
	} );
	
} );

// *** API Methods ***

describe( "lib/ProjectUtils.js readConfig", function(){

	beforeEach( function(){

		tU.createProjectFolder();

	} );

	afterEach( function(){

		tU.removeProjectFolder();

	} );

	it( "should return a default configuration object if one does not exist in the project root", function(){
		
		var config = pru.readConfig( projectRoot );
		
		expect( typeof config ).toEqual( "object" );
		expect( config.src ).toEqual( "src" );
		expect( config.doc ).toEqual( "doc" );
		expect( config.public ).toEqual( "public" );
		
	} );
	
	it( "should return an existing configuration object from the project root", function(){

		var src = "srcTest";
		var doc = "docTest";
		var public = "publicTest";

		pru.setup( {

			"src": src,
			"doc": doc,
			"public": public

		}, projectRoot );

		var config = pru.readConfig( projectRoot );
		
		expect( typeof config ).toEqual( "object" );
		expect( config.src ).toEqual( src );
		expect( config.doc ).toEqual( doc );
		expect( config.public ).toEqual( public );
		
	} );
	
} );

describe( "lib/ProjectUtils.js setup", function(){
	
	beforeEach( function(){

		tU.createProjectFolder();
		
	} );
	
	afterEach( function(){

		tU.removeProjectFolder();
		
	} );

	var src = "srcTest";
	var doc = "docTest";
	var public = "publicTest";
	var cfg = "PSVGConfig.json";

	it( "should create a 'source' folder in the project root", function(){
		
		pru.setup( { "src": src }, projectRoot );
		
		var created = fs.existsSync( projectRoot + pathUtils.sep + src );
		
		expect( created ).toEqual( true );
		
	} );
	
	it( "should create a 'documentation' folder in the project root", function(){

		pru.setup( { "doc": doc }, projectRoot );

		var created = fs.existsSync( projectRoot + pathUtils.sep + doc );

		expect( created ).toEqual( true );

	} );

	it( "should create a 'public' folder in the project root", function(){

		pru.setup( { "public": public }, projectRoot );

		var created = fs.existsSync( projectRoot + pathUtils.sep + public );

		expect( created ).toEqual( true );

	} );
	
	it( "should create a PSVGConfig.json file in the project root", function(){

		pru.setup( {
			
			"src": src,
			"doc": doc,
			"public": public
			
		}, projectRoot );

		var created = fs.existsSync( projectRoot + pathUtils.sep + cfg );

		expect( created ).toEqual( true );
		
	} );

	it( "should create a PSVGConfig.json file in the project root that contains the 'source', 'documentation' and 'public' folder paths", function(){

		pru.setup( {

			"src": src,
			"doc": doc,
			"public": public

		}, projectRoot );
		
		var fullCFGPath = projectRoot + pathUtils.sep + cfg;
		
		var created = fs.existsSync( fullCFGPath );

		var cfgObj = {};
		
		if( created ){

			cfgObj = JSON.parse( fs.readFileSync( fullCFGPath, "utf8" ) );
			
		}

		expect( cfgObj.src ).toEqual( src );
		expect( cfgObj.doc ).toEqual( doc );
		expect( cfgObj.public ).toEqual( public );
		
	} );
	
} );

describe( "lib/ProjectUtils.js makeDocs", function(){

	beforeEach( function(){

		tU.createProjectFolder();

	} );

	afterEach( function(){

		tU.removeProjectFolder();

	} );
	
	it( "should document all source files", function(){
		
		pru.makeDocs( tU.deployConfig, tU.projectRoot );
		
		var readmeCreated = fs.existsSync( tU.projectDoc + pathUtils.sep + "README.md" );
		
		expect( readmeCreated ).toEqual( true );
		
	} );
	
} );
