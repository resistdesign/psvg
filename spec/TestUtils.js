
var fs = require( "fs" );
var pathUtils = require( "path" );
var wrench = require( "wrench" );

// *** Module ***

module.exports = {};

// *** Properties ***

module.exports.deployConfig = {
	
	src: "srcTest",
	doc: "docTest",
	public: "publicTest",
	docFiles: [
		
		"js",
		"compdir.js"
		
	]

};

module.exports.playground = "test-playground";

module.exports.testProject = "test-project";

module.exports.builtInAssets = "assets";

module.exports.builtInTmpl = "tmpl";

module.exports.testSrc = module.exports.playground + pathUtils.sep + "test-src";

module.exports.projectRoot = fs.realpathSync( "./" ) + pathUtils.sep + module.exports.playground + pathUtils.sep + module.exports.testProject;

module.exports.projectSrc = module.exports.projectRoot + pathUtils.sep + module.exports.deployConfig.src;

module.exports.projectDoc = module.exports.projectRoot + pathUtils.sep + module.exports.deployConfig.doc;

module.exports.publicRoot = module.exports.projectRoot + pathUtils.sep + module.exports.deployConfig.public;

module.exports.publicAssets = module.exports.publicRoot + pathUtils.sep + module.exports.builtInAssets;

module.exports.targetDocPath = module.exports.projectRoot + pathUtils.sep + module.exports.deployConfig.doc;
module.exports.tmplRoot = fs.realpathSync( "./" ) + pathUtils.sep + module.exports.builtInTmpl;
module.exports.tmplFilters = module.exports.tmplRoot + pathUtils.sep + "filters";
module.exports.tmplViews = module.exports.tmplRoot + pathUtils.sep + "views";
module.exports.tmplDocFolder = "doc";
module.exports.readmeTmplName = module.exports.tmplDocFolder + pathUtils.sep + "README";
module.exports.fileTmplName = module.exports.tmplDocFolder + pathUtils.sep + "file";

// *** API Methods ***

module.exports.removeProjectFolder = function(){

	if( fs.existsSync( module.exports.projectRoot ) ) wrench.rmdirSyncRecursive( module.exports.projectRoot );

};

module.exports.createProjectFolder = function(){

	module.exports.removeProjectFolder();
	wrench.mkdirSyncRecursive( module.exports.projectRoot );
	wrench.copyDirSyncRecursive( module.exports.testSrc, module.exports.projectSrc, { forceDelete: true } );

};
