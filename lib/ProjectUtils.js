
/**
 * @info - Utilities for setting up and managing a Parasol SVG project.
 * */

// *** Imports ***

var fs = require( "fs" );
var pathUtils = require( "path" );
var jsb = require( "js-beautify" );
var extend = require( "extend" );
var jsu = require( "./JSUtils.js" );
var dep = require( "./Deploy.js" );
var docGen = require( "./DocGen.js" );
var psvg = require( "./PSVG.js" );

// *** Private Properties ***

var builtInSrcDir = "built-in-src";
var tmplDir = "tmpl";
var viewFilterDir = "filters";
var viewTmplDir = "views";

var defaultDocTmplDir = "doc";
var defaultFileTemplateName = "file";
var defaultReadmeTemplateName = "README";

module.exports = {
	
	// *** Properties ***
	
	getSVGCompDirExt: function(){
		
		return psvg.compilerDirectiveExt;
		
	},
	
	getSVGAppExt: function(){
		
		return dep.svgAppExt;
		
	},
	
	getPSVGConfigFileName: function(){
		
		return "PSVGConfig.json";
		
	},
	
	// *** Helper Methods ***
	
	mkdir: function( projectRoot, dir ){
		
		var absPath = projectRoot + pathUtils.sep + dir;
		
		var dirExists = fs.existsSync( absPath );
		
		if( !dirExists ){
			
			fs.mkdirSync( absPath );
			
		}
		
	},
	
	// *** API Methods ***
	
	readConfig: function( projectRoot ){
		
		if( !projectRoot ) projectRoot = fs.realpathSync( "./" );
		
		var config = {
			
			src: "src",
			doc: "doc",
			public: "public",
			docFiles: [

				"js",
				"compdir.js",
				"app.js"

			],
			excludeFromProduction: []
			
		};
		
		var cfgPath = projectRoot + pathUtils.sep + module.exports.getPSVGConfigFileName();
		
		var configExists = fs.existsSync( cfgPath );
		
		if( configExists ){
			
			var cfgStr = fs.readFileSync( cfgPath, "utf8" );
			
			var storedCFG = JSON.parse( cfgStr );
			
			if( "object" == typeof storedCFG ){
				
				config = extend( true, config, storedCFG );
				
			}
			
		}
		
		return config;
		
	},
	
	setup: function( config, projectRoot ){

		if( !jsu.isType( config, "object" ) ) config = {};

		if( !projectRoot ) projectRoot = fs.realpathSync( "./" );

		var storedCFG = module.exports.readConfig( projectRoot );
		
		config = extend( true, storedCFG, config );
		
		if( !projectRoot || !fs.existsSync( projectRoot ) ) return;
		
		if( "undefined" != typeof config.src ) module.exports.mkdir( projectRoot, config.src );
		if( "undefined" != typeof config.doc ) module.exports.mkdir( projectRoot, config.doc );
		if( "undefined" != typeof config.public ) module.exports.mkdir( projectRoot, config.public );
		
		var cfgStr = JSON.stringify( config );
		cfgStr = jsb.js_beautify( cfgStr );
		
		fs.writeFileSync( projectRoot + pathUtils.sep + module.exports.getPSVGConfigFileName(), cfgStr );
		
	},
	
	deploy: function( config, projectRoot, debug ){
		
		dep.deploy( config, projectRoot, debug );
		
	},
	
	makeDocs: function( config, projectRoot ){

		if( !projectRoot ) projectRoot = fs.realpathSync( "./" );

		if( !jsu.isType( config, "object" ) ) config = module.exports.readConfig( projectRoot );
		
		if( !jsu.verifyObjectWithProperties( config, [ "src", "doc", "docFiles" ] ) ) return;
		
		var absSrcPath = projectRoot + pathUtils.sep + config.src;
		var builtInAbsSrcPath = fs.realpathSync( __dirname ) + pathUtils.sep + builtInSrcDir;
		
		var moduleRootDir = fs.realpathSync( __dirname + pathUtils.sep + "../" );
		var tmplRootDir = moduleRootDir + pathUtils.sep + tmplDir;
		
		// makeDoc parameters.
		
		var absoluteSrcPathList = [ builtInAbsSrcPath, absSrcPath ];
		var docPath = projectRoot + pathUtils.sep + config.doc;
		var fileExtList = config.docFiles;
		var viewFilterPath = tmplRootDir + pathUtils.sep + viewFilterDir;
		var docTemplateRoot = tmplRootDir + pathUtils.sep + viewTmplDir;
		var fileTemplateName = defaultDocTmplDir + pathUtils.sep + defaultFileTemplateName;
		var readmeTemplateName = defaultDocTmplDir + pathUtils.sep + defaultReadmeTemplateName;
		
		docGen.makeDocs( absoluteSrcPathList, docPath, fileExtList, viewFilterPath, docTemplateRoot, fileTemplateName, readmeTemplateName );
		
	}
	
};
