
/**
 * @info - Tool for minifying, processing and deploying compiled assets to a public folder.
 * */

// *** Imports ***

var jsu = require( "./JSUtils.js" );
var fs = require( "fs" );
var pathUtils = require( "path" );
var wrench = require( "wrench" );
var extend = require( "extend" );
var pub = require( "./Publicity.js" );

// *** Processors ***

var less = require( "less" );
var ugly = require( "uglify-js" );
var psvg = require( "./PSVG.js" );

// *** Path Values ***

var tmplDir = "tmpl";
var viewFilterDir = "filters";
var viewTmplDir = "views";
var moduleRootDir = fs.realpathSync( __dirname + pathUtils.sep + "../" );
var tmplRootDir = moduleRootDir + pathUtils.sep + tmplDir;
var viewFilterPath = tmplRootDir + pathUtils.sep + viewFilterDir;
var docTemplateRoot = tmplRootDir + pathUtils.sep + viewTmplDir;

// *** File Extensions ***

var ATTR_FILE_EXT = "attr.js";
var META_FILE_EXT = "meta.js";

// *** Setup Publicity ***

var setupPublicity = function(){

	pub.templateRoot = docTemplateRoot;
	pub.filters = pub.getViewFilters( viewFilterPath );

};

module.exports = {

	// *** Properties ***

	builtInJSAssetMap: {

		"angular.min.js": true,
		"angular-route.min.js": true,
		"jquery.min.js": true,
		"app.min.js": true

	},

	appTmplPath: "app" + pathUtils.sep + "app",

	svgAppExt: "app.svg",
	svgCompExt: "comp.svg",
	svgAppJSExt: "app.js",

	extMap: {

		"less": "css",
		"js": "min.js",
		"app.js": "min.js",
		"comp.svg": "html",
		"app.svg": "html"

	},

	ignoredExtList: [

		ATTR_FILE_EXT,
		META_FILE_EXT,
		psvg.compilerDirectiveExt,
		"git*"

	],

	processorMap: {

		"less": function( content, config ){

			// Conver less.

			var cssContent = "";

			// Make sync.
			var wait = { done: false };

			less.render( content, function( err, css ){

				cssContent = css;

				wait.done = true;

			} );

			while( !wait.done ){

				continue;

			}

			return cssContent;

		},
		"js": function( content, config ){

			// Minify js.

			if( jsu.verifyObjectWithProperties( config, [ "debug" ] ) && config.debug ){

				return content;

			}

			var minJSContent = ugly.minify( content, { fromString: true } ).code;

			return minJSContent;

		},
		"app.js": function( content, config ){

			// Minify js.

			if( jsu.verifyObjectWithProperties( config, [ "debug" ] ) && config.debug ){

				return content;

			}

			var minJSContent = ugly.minify( content, { fromString: true } ).code;

			return minJSContent;

		},
		"comp.svg": function( content, config ){

			// Convert SVG.

			content = psvg.transformSVG( content, config.projectSrc, config.compilerDirectivesList, false, config.extAttrs );

			return content;

		},
		"app.svg": function( content, config ){

			// Convert SVG.

			content = psvg.transformSVG( content, config.projectSrc, config.compilerDirectivesList, true, config.extAttrs );

			return content;

		}


	},

	// *** Helper Methods ***

	getFullPath: function( rootPath, subPath, asRelative ){

		if( asRelative ){

			if( "string" === typeof subPath && subPath.indexOf( fs.realpathSync( pathUtils.sep ) ) === 0 ) return subPath;

		}

		return rootPath + pathUtils.sep + subPath;

	},

	getFullBuiltInSrcPath: function(){

		return module.exports.getFullPath( __dirname, "built-in-src" );

	},

	verifyConfig: function( config, projectRoot ){

		return jsu.verifyObjectWithProperties( config, [ "src", "doc", "public" ] ) && !jsu.isUndefined( projectRoot );

	},

	getFileTargetPath: function( fileRootPath, filePath, targetRoot ){

		// Convert Extension.
		var fileExt = jsu.getFullFileExt( filePath );
		var newExt = module.exports.extMap[ fileExt ];

		if( jsu.isType( newExt, "string" ) ){

			var tempFilePath = filePath.substr( 0, filePath.length - fileExt.length );

			filePath = tempFilePath + newExt;

		}

		// Remove fileRootPath from filePath.
		var subFilePath = filePath.substr( fileRootPath.length, filePath.length );
		if( subFilePath.indexOf( pathUtils.sep ) === 0 ) subFilePath = subFilePath.substr( 1, subFilePath.length );

		// Prepend targetRoot.
		var targetPath = module.exports.getFullPath( targetRoot, subFilePath );

		return targetPath;

	},

	ignoreExt: function( ext ){

		if( jsu.isUndefined( ext ) ) return false;

		var extList = module.exports.ignoredExtList;

		if( !jsu.isArray( extList ) ) return false;

		for( var i = 0; i < extList.length; i++ ){

			var fileExt = extList[ i ];

			if( fileExt.indexOf( "*" ) === fileExt.length - 1 ){

				var fileExtNoStar = fileExt.substr( 0, fileExt.length - 1 );

				if( ext.indexOf( fileExtNoStar ) === 0 ){

					return true;

				}

			}else if( fileExt === ext ){

				return true;

			}

		}

		return false;

	},

	getExtendedAttributes: function( filePath ){

		var extAttrs;

		var fileDirName = pathUtils.dirname( filePath );
		var baseFileName = pathUtils.basename( filePath ).split( "." ).shift();

		var attrFileName = module.exports.getFullPath( fileDirName, baseFileName ) + "." + ATTR_FILE_EXT;

		try{

			jsu.uncacheModule( attrFileName );

			extAttrs = require( attrFileName );

		}catch( extAttrError ){

			// Ignore.

		}

		return extAttrs;

	},

	getAppMetaData: function( filePath ){

		var metaData;

		var fileDirName = pathUtils.dirname( filePath );
		var baseFileName = pathUtils.basename( filePath ).split( "." ).shift();

		var metaFileName = module.exports.getFullPath( fileDirName, baseFileName ) + "." + META_FILE_EXT;

		try{

			jsu.uncacheModule( metaFileName );

			metaData = require( metaFileName );

		}catch( metaDataError ){

			// Ignore.

		}

		return metaData;

	},

	deploySingleFile: function( targetRoot, fileName, fileRootPath, processorCFG, fileCache ){

		var filePath = module.exports.getFullPath( fileRootPath, fileName );

		if( fs.statSync( filePath ).isDirectory() ) return;

		var fileExt = jsu.getFullFileExt( filePath );

		if( module.exports.ignoreExt( fileExt ) ) return;

		var targetFilePath = pathUtils.resolve( module.exports.getFileTargetPath( fileRootPath, filePath, targetRoot ) );

		var processorFunction = module.exports.processorMap[ fileExt ];

		var fileObj = {

			ext: fileExt,
			targetPath: targetFilePath,
			srcPath: filePath

		};

		// IMPORTANT: Ensure that the target directory exists.
		wrench.mkdirSyncRecursive( pathUtils.dirname( targetFilePath ) );

		if( jsu.isType( processorFunction, "function" ) ){

			// Process and copy file.

			var fileContent = fs.readFileSync( filePath, "utf8" );

			var extProcessorCFG = processorCFG[ fileExt ];

			// IMPORTANT: Get extended attributes.
			var extendedAttributes = fileExt == module.exports.svgAppExt || fileExt == module.exports.svgCompExt ? module.exports.getExtendedAttributes( filePath ) : undefined;

			var fileInstanceCFG = extendedAttributes ? { extAttrs: extendedAttributes } : {};

			// Apply file type config properties to the file instance config object.
			for( var fT in extProcessorCFG ){

				fileInstanceCFG[ fT ] = extProcessorCFG[ fT ];

			}

			var processedContent = processorFunction( fileContent, fileInstanceCFG );

			fileObj.content = processedContent;

			fileObj.save = function(){

				fs.writeFileSync( fileObj.targetPath, fileObj.content );

				var stat = fs.lstatSync( filePath );
				fs.chmodSync( targetFilePath, stat.mode );

			};

		}else{

			// Copy file.

			var rawContents = fs.readFileSync( filePath );

			fileObj.content = rawContents;

			fileObj.save = function(){

				fs.writeFileSync( fileObj.targetPath, fileObj.content );

				var stat = fs.lstatSync( filePath );
				fs.chmodSync( targetFilePath, stat.mode );

			};

		}

		if( jsu.isArray( fileCache ) ){

			fileCache.push( fileObj );

		}else{

			fileObj.save();

		}

	},

	deploySrcFiles: function( srcPath, config, projectRoot, processorCFG, singleFile, fileCache, excludedFiles ){

		if( !srcPath || !module.exports.verifyConfig( config, projectRoot ) ) return;

		var useSingleFile = jsu.isType( singleFile, "string" );

		var publicPath = module.exports.getFullPath( projectRoot, config.public, true );

		var fileList = useSingleFile ? [ singleFile ] : wrench.readdirSyncRecursive( srcPath );
		wrench.mkdirSyncRecursive( publicPath );

		for( var i = 0; i < fileList.length; i++ ){

			var filePath = fileList[ i ];
			var filePathFullExt = jsu.getFullFileExt( filePath );

			// IMPORTANT: Exclude certain files/folders from a production build.
			if( jsu.isArray( excludedFiles ) ){

				var excluded = false;

				for( var j = 0; j < excludedFiles.length; j++ ){

					var exFile = excludedFiles[ j ];

					var isWildCardExt = exFile.indexOf( "*" ) === 0;

					var exFileFullExt = jsu.getFullFileExt( exFile );

					if( exFile === filePath || filePath.indexOf( exFile ) === 0 || ( isWildCardExt && filePathFullExt === exFileFullExt ) ){

						excluded = true;

						break;

					}

				}

				if( excluded ) continue;

			}

			module.exports.deploySingleFile( publicPath, filePath, srcPath, processorCFG, fileCache );

		}

	},

	removePublicPath: function( config, projectRoot ){

		if( !module.exports.verifyConfig( config, projectRoot ) ) return;

		var publicPath = module.exports.getFullPath( projectRoot, config.public, true );

		if( fs.existsSync( publicPath ) ) wrench.rmdirSyncRecursive( publicPath );

	},

	createPublicPath: function( config, projectRoot ){

		if( !module.exports.verifyConfig( config, projectRoot ) ) return;

		var publicPath = module.exports.getFullPath( projectRoot, config.public, true );

		wrench.mkdirSyncRecursive( publicPath );

	},

	getSVGProcessorDirectives: function( projectSrc ){

		// Built-in compiler directives.
		var builtInSRcPath = module.exports.getFullBuiltInSrcPath();
		var builtInCompDirs = psvg.getCompilerDirectives( builtInSRcPath );

		// Project compiler directives.
		var projectCompDirs = psvg.getCompilerDirectives( projectSrc );

		return [ builtInCompDirs, projectCompDirs ];

	},

	processFileCache: function( config, projectRoot, fileCache ){

		if( !jsu.isType( projectRoot, "string" ) ) return;
		if( !jsu.verifyObjectWithProperties( config, [ "public" ] ) ) return;

		if( jsu.isArray( fileCache ) ){

			// Setup Publicity.
			setupPublicity();

			var relativeTargetPath = "string" === typeof config.public && config.public.indexOf( fs.realpathSync( pathUtils.sep ) ) === 0;

			var targetPublicPath = fs.realpathSync( module.exports.getFullPath( projectRoot, config.public, relativeTargetPath ) );

			var appFileCache = [];

			var appObj = {};

			// Collect and save assets.
			for( var i = 0; i < fileCache.length; i++ ){

				var fileObj = fileCache[ i ];

				if( fileObj.ext == module.exports.svgAppExt ){

					// Skip App SVG files.
					appFileCache.push( fileObj );

					continue;

				}else if( fileObj.ext != psvg.compilerDirectiveExt ){

					// Collect a list of assets to include.

					// IMPORTANT: Save file.
					fileObj.save();

					// Avoid the built-in JavaScript assets as they will be handled in the app template.
					if( module.exports.builtInJSAssetMap[ pathUtils.basename( fileObj.targetPath ) ] ) continue;

					// Avoid the `app.js` files as they will be handled in the app template.
					if( fileObj.ext == module.exports.svgAppJSExt ) continue;

					var currExt = fileObj.ext;
					var extKey = String( module.exports.extMap[ currExt ] || currExt ).split( "." ).join( "_" );
					if( !jsu.isArray( appObj[ extKey ] ) ) appObj[ extKey ] = [];

					// TRICKY: Modify the target file path based on whether or not it is a relative or absolute path.
					var fileTargetPath = "string" === typeof fileObj.targetPath && pathUtils.resolve( fileObj.targetPath ) !== pathUtils.normalize( fileObj.targetPath ) ? fs.realpathSync( module.exports.getFullPath( projectRoot, fileObj.targetPath ) ) : fileObj.targetPath;

					var includePath = fileTargetPath.split( targetPublicPath ).join( "" );

					if( "string" === typeof includePath && includePath.indexOf( "/" ) === 0 ) includePath = includePath.substr( 1, includePath.length );

					appObj[ extKey ].push( includePath );

				}

			}

			// Build App SVG HTML files.
			for( var j = 0; j < appFileCache.length; j++ ){

				var appFileObj = appFileCache[ j ];

				var currAppObj = { includes: extend( true, {}, appObj ) };

				currAppObj.name = pathUtils.basename( appFileObj.targetPath, "." + jsu.getFullFileExt( appFileObj.targetPath ) );
				currAppObj.content = appFileObj.content;

				// IMPORTANT: Load app meta data.
				currAppObj.meta = module.exports.getAppMetaData( appFileObj.srcPath );

				// Build app view template with includes.
				appFileObj.content = pub.buildSingleView( currAppObj, module.exports.appTmplPath, j );

				appFileObj.save();

			}

		}

	},

	// *** API Methods ***

	deploy: function( config, projectRoot, debug, singleFile ){

		// IMPORTANT: Make sure everything is in order before we begin.
		if( !module.exports.verifyConfig( config, projectRoot ) ) return false;

		var projectSrc = module.exports.getFullPath( projectRoot, config.src );

		var useSingleFile = jsu.isType( singleFile, "string" );

		// Remove public folder if it exists.
		if( !useSingleFile ) module.exports.removePublicPath( config, projectRoot );

		// Make public folder.
		module.exports.createPublicPath( config, projectRoot );

		// Get SVG compiler directives.
		var svgCompDirs = module.exports.getSVGProcessorDirectives( projectSrc );

		// Create JS processor config object.
		var jsProCFG = {

			"debug": debug

		};

		// Create SVG processor config object.
		var svgProCFG = {

			"projectSrc": projectSrc,
			"compilerDirectivesList": svgCompDirs

		};

		// Create processorCFG.
		var processorCFG = {

			"comp.svg": svgProCFG,
			"js": jsProCFG,
			"app.svg": svgProCFG,
			"app.js": jsProCFG

		};

		var fileCache;

		if( !useSingleFile ){

			fileCache = [];

			// Process and move built-in src contents to public folder.
			var builtInSrcPath = module.exports.getFullBuiltInSrcPath();
			module.exports.deploySrcFiles( builtInSrcPath, config, projectRoot, processorCFG, undefined, fileCache );

		}

		// Process and move project src contents to public folder.
		var excludedFiles = !debug && jsu.isArray( config.excludeFromProduction ) ? config.excludeFromProduction : undefined;
		var projectSrcPath = module.exports.getFullPath( projectRoot, config.src );
		module.exports.deploySrcFiles( projectSrcPath, config, projectRoot, processorCFG, singleFile, fileCache, excludedFiles );

		if( jsu.isArray( fileCache ) ){

			module.exports.processFileCache( config, projectRoot, fileCache );

		}

		return true;

	}

};
