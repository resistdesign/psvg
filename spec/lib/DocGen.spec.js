
var docGen = require( "../../lib/DocGen.js" );
var tU = require( "../TestUtils.js" );
var pathUtils = require( "path" );
var fs = require( "fs" );

// *** Setup ***

var readmeFileDoc = tU.targetDocPath + pathUtils.sep + docGen.readmeFileName;
var testSrcFileDoc = tU.targetDocPath + pathUtils.sep + "test-src.md";

var genDocs = function(){

	docGen.makeDocs( [ tU.projectSrc ], tU.targetDocPath, tU.deployConfig.docFiles, tU.tmplFilters, tU.tmplViews, tU.fileTmplName, tU.readmeTmplName );
	
};

var fileToContain = function( path, value ){
	
	var fileContents = fs.readFileSync( path, "utf8" );
	
	return fileContents.indexOf( value ) !== -1;
	
};

describe( "lib/DocGen.js makeDocs", function(){
	
	beforeEach( function(){
		
		tU.createProjectFolder();
		
	} );
	
	afterEach( function(){
		
		tU.removeProjectFolder();
		
	} );
	
	it( "should create a README file in the target document path", function(){

		genDocs();
		
		var readmeCreated = fs.existsSync( readmeFileDoc );
		
		expect( readmeCreated ).toEqual( true );
		
	} );
	
	it( "should create a document for each included source file in the target document path", function(){
		
		genDocs();
		
		var docCreated = fs.existsSync( testSrcFileDoc );
		
		expect( docCreated ).toEqual( true );
		
	} );
	
	it( "should list all directives as links in the README file", function(){
		
		genDocs();
		
		expect( fileToContain( readmeFileDoc, "[p-input](p/input.md)" ) ).toEqual( true );
		
	} );
	
	it( "should include all document comment data in each file's document", function(){
		
		genDocs();
		
		expect( fileToContain( testSrcFileDoc, " - The second value." ) ).toEqual( true );
		
	} );
	
} );
