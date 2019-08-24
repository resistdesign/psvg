#!/usr/bin/env node

var PSVG_CONSOLE_NAME = "[ParasolSVG]";

var argv = require( "optimist" ).argv;
var pathUtils = require( "path" );
var pru = require( "./lib/ProjectUtils.js" );
var fs = require( "fs" );
var url = require( "url" );
var jsu = require( "./lib/JSUtils.js" );
var apiMock = require( "./lib/APIMock.js" );

var debug = argv.debug;
var setup = argv.setup;
var deploy = argv.deploy;
var target = argv.target;
var doc = argv.doc;
var run = argv.run;
var srclist = argv.srclist;
var mock = argv.mock;
var port = argv.port ? argv.port : 8080;

var cwd = process.cwd();

var config = pru.readConfig( cwd );

if( setup ){
	
	pru.setup( config, cwd );
	
}

if( deploy ){
	
	if( config && target ){
		
		config.public = target;
		
	}
	
	pru.deploy( config, cwd, debug );
	
}

if( doc ){
	
	pru.makeDocs( config, cwd );
	
}

// *** Watch/Run ***

var CONTENT_CHANGED_AT = new Date().getTime();
var AUTO_RELOAD_CHECK = "AUTO_RELOAD_CHECK";

var getAutoReloadJS = function(){
	
	var autoReloadJS = fs.readFileSync( __dirname + pathUtils.sep + "auto-reload.js", "utf8" );
	
	var open = '<script type="application/javascript">';
	var close = '</script>';
	
	var wrappedARJS = open + autoReloadJS + close;
	
	return wrappedARJS;
	
};

var autoReloadHandler = function( path ){
	
	return function( req, res, next ){
		
		// IMPORTANT: No Cache!
		res.setHeader( "Pragma", "no-cache" );
		res.setHeader( "Expires", "-1" );
		res.setHeader( "Cache-Control", "no-cache" );
		
		// Target URL Info.
		var parsed = url.parse( req.url );
		var filepath = pathUtils.normalize( pathUtils.join( path, decodeURIComponent( parsed.pathname ) ) );
		var index = pathUtils.normalize( "/" ) === filepath.charAt( filepath.length - 1 );

		if( index ) filepath += "index.html";

		if( pathUtils.basename( filepath ) === AUTO_RELOAD_CHECK ){

			// Respond to checkUpdate request.
			
			var updateValue = String( CONTENT_CHANGED_AT );
			
			res.setHeader( "Content-Type", "application/json" );
			res.setHeader( "Content-Length", updateValue.length );
			return res.end( updateValue );
			
		}
		
		var ext = jsu.getFullFileExt( filepath );
		
		if( ext && ext == "html" ){

			// Inject JS into .html files.
			
			var htmlValue = fs.readFileSync( filepath, "utf8" );
			
			var useReload = !req.query.noReload || req.query.noReload === "false";
			
			var reloadScript = useReload ? getAutoReloadJS() : "";
			
			htmlValue = htmlValue.split( '</body>' ).join( reloadScript + '</body>' );
			
			res.setHeader( "Content-Type", "text/html" );
			res.setHeader( "Content-Length", htmlValue.length );
			return res.end( htmlValue );
			
		}
		
		return next();
		
	};
	
};

var getRelayConfig = function(){
	
	var relayConfig = false;
	
	if( argv.relay ){
		
		var relParts = argv.relay.split( ":" );
		
		var h = relParts[ 0 ];
		var portAndAPI = relParts[ 1 ];
		var endParts = portAndAPI ? portAndAPI.split( "/" ) : [ 80 ];
		var p = endParts[ 0 ];
		var a = "/" + ( endParts[ 1 ] ? endParts[ 1 ] : "api" );
		
		if( h ){
			
			relayConfig = {
				
				host: h,
				port: p,
				prefix: a
				
			};
			
		}
		
	}
	
	return relayConfig;
	
};

var getMockData = function( method, path, mockModulePath ){
	
	if( path.indexOf( "/" ) === 0 ) path = path.substr( 1, path.length );
	
	mockModulePath = fs.realpathSync( mockModulePath );
	
	var mockMod = require( mockModulePath );
	
	return {
		
		$headers: apiMock.getHeaders( mockMod, method, path ),
		$body: apiMock.getBody( mockMod, method, path )
		
	};
	
};

var setupRequestRelay = function( path, relayConfig ){
	
	// Relay Requests To API Server.
	var http = require( "http" );
	
	// *** API Throttling ***
	var throttleTime = argv.throttle ? parseInt( argv.throttle ) : 0;
	
	return function( req, res, next ) {

		if ( req.url.indexOf( relayConfig.prefix ) === 0 ){

			var parsedURL = url.parse( req.url, true );
			
			var urlPathName = parsedURL.pathname;
			
			// IMPORTANT: Remove trailing slash.
			if( urlPathName && urlPathName.charAt( urlPathName.length - 1 ) === "/" ){

				urlPathName = urlPathName.substr( 0, urlPathName.length - 1 );
				
			}
			
			var mockData = mock ? getMockData( req.method, urlPathName, mock ) : false;
			
			if( mockData && "undefined" !== typeof mockData.$body ){
				
				// *** Mock Data ***

				console.log( "Supplying MOCK DATA for: " + req.url );
				
				var headers = mockData.$headers || {};
				
				if( "function" === typeof headers ){
					
					headers = headers( req, urlPathName, parsedURL.query );
					
				}
				
				var body = mockData.$body;

				if( "function" === typeof body ){

					body = body( req, urlPathName, parsedURL.query );

				}
				
				body = "undefined" === typeof body ? "undefined" : JSON.stringify( body );
				
				if( "undefined" === typeof headers[ "Content-Type" ] ) headers[ "Content-Type" ] = "application/json";
				headers[ "Content-Length" ] = body.length;
				
				res.writeHead( 200, headers );
				res.write( body );
				res.end();
				
			}else{
				
				// *** API Relay ***
				
				console.log( "Relaying request SENT to: " + req.url );

				// Remove host.
				delete req.headers.host;

				var relayReq = http.request( {

					host: relayConfig.host,
					port: parseInt( relayConfig.port ),
					path: req.url,
					method: req.method,
					headers: req.headers

				} );

				relayReq.on( "response", function( relayRes ){

					res.writeHead( relayRes.statusCode, relayRes.headers );

					relayRes.on( "data", function( data ){

						res.write( data );

					} );

					relayRes.on( "end", function(){

						// Throttle response.
						if( throttleTime ) console.log( "Throttling API Relay for " + throttleTime + " ms" );

						setTimeout( function(){

							res.end();

						}, throttleTime );

					} );

				} );

				relayReq.on( "error", function( error ){

					console.log( "Relaying request ERROR for: " + req.url );

					res.writeHead( 500 );

					res.end();

					relayReq.end();

				} );

				req.on( "data", function ( data ) { relayReq.write( data ); } );
				req.on( "end", function () {

					console.log( "Relaying request COMPLETE for: " + req.url );

					relayReq.end();

				} );

			}
			
		}else{

			return next();
			
		}
		
	};
	
};

var watchConnectServer = function( path, onReady ){

	var connect = require('connect');
	
	var server = connect();
	
	// Query params.
	server.use( connect.query() );
	
	// IMPORTANT: Auto-Reload Middle-ware.
	server.use( autoReloadHandler( path ) );

	// Setup API Relay.
	var relayConfig = getRelayConfig();

	if( relayConfig ){
		
		server.use( setupRequestRelay( path, relayConfig ) );

	}

	// Setup Static Content.
	server.use( connect.static( path ) );

	var serverPort = port;
	
	server.listen(serverPort, function(){
		
		console.log('listening on http://0.0.0.0:' + serverPort);
		
		if( "function" == typeof onReady ){
			
			onReady();
			
		}
		
	});
	
};

var fullDeployExtMap = {};
fullDeployExtMap[ pru.getSVGCompDirExt() ] = true;
fullDeployExtMap[ pru.getSVGAppExt() ] = true;

var ignoreWatchedFileEndings = {
	
	"___jb_bak___": true,
	"___jb_old___": true
	
};

var watchSrcFolders = function( srcFolderList ){
	
	// Watch and Deploy.
	var chokidar = require('chokidar');
	
	var pathsToProcess = [];
	var bufferTimer = -1;
	var bufferMax = 10;
	var bufferWait = 500;
	
	var processPath = function( path, fullDeploy ){
		
		try{
			
			if( "undefined" == typeof path || !fs.existsSync( path ) || fs.statSync( path ).isDirectory() ) fullDeploy = true;
			
			var ext = jsu.getFullFileExt( path );
			
			if( fullDeploy || fullDeployExtMap[ ext ] ){
				
				console.log( PSVG_CONSOLE_NAME + " Deploying: All" );
				
				// Re-deploy all.
				pathsToProcess = [];
				
				pru.deploy( config, cwd, debug );

			}else{

				console.log( PSVG_CONSOLE_NAME + " Deploying: " + path );

				// Just deploy the single file.
				pru.deploy( config, cwd, debug, path );

			}

			console.log( PSVG_CONSOLE_NAME + " Deploy Complete." );
			
		}catch( error ){
			
			// IGNORE: Keep on truckin'!
			
		}
		
		CONTENT_CHANGED_AT = new Date().getTime();
		
	};
	
	var onFileChange = function( path ){
		
		try{

			// IMPORTANT: Check for ignored ending patterns.

			for( var e in ignoreWatchedFileEndings ){
				
				if( path.indexOf( e ) === path.length - e.length ) return;
				
			}
			
		}catch( pathError ){
			
			return;
			
		}
		
		console.log( PSVG_CONSOLE_NAME + " File/Folder Changed: " + path );
		
		clearTimeout( bufferTimer );
		
		var setupFullDeploy = function(){
			
			pathsToProcess = [];

			bufferTimer = setTimeout( function(){
				
				processPath( undefined, true );

			}, bufferWait );

		};
		
		var processBuffer = function(){
			
			while( pathsToProcess.length > 0 ){
				
				var currPath = pathsToProcess.shift();

				processPath( currPath );
				
			}
			
		};

		pathsToProcess.push( path );

		if( pathsToProcess.length > bufferMax ){

			setupFullDeploy();

		}else{

			bufferTimer = setTimeout( processBuffer, bufferWait );

		}

	};
	
	var watcher = chokidar.watch( srcFolderList, {ignored: /^\./, persistent: true, ignoreInitial: true} );

	watcher
		.on('add', onFileChange)
		.on('change', onFileChange)
		.on('unlink', onFileChange)
		.on('error', function(error) {console.error('Error happens!', error);});
	
};

var runFunc = function(){
	
	var baseSrcFold = cwd + pathUtils.sep + config.src;
	
	var builtInSrcFolder = __dirname + pathUtils.sep + "lib" + pathUtils.sep + "built-in-src";
	
	var fullSrcFolderList = [ baseSrcFold, builtInSrcFolder ];

	if( "string" == typeof srclist ){

		var srcFolderList = srclist.split( "," );

		for( var i = 0; i < srcFolderList.length; i++ ){

			var srcFold = srcFolderList[ i ];

			var fullSrcFold = cwd + pathUtils.sep + srcFold;

			fullSrcFolderList.push( fullSrcFold );

		}

	}

	var onReady = function(){
		
		watchSrcFolders( fullSrcFolderList );
		
	};
	
	var pathPrefix = "string" === typeof config.public && config.public.indexOf( fs.realpathSync( pathUtils.sep ) ) === 0 ? "" : cwd + pathUtils.sep;
	
	watchConnectServer( pathPrefix + config.public, onReady );
	
};

if( run ){
	
	// IMPORTANT: Force debug mode for this tool.
	debug = true;

	console.log( PSVG_CONSOLE_NAME + " Deploying: All" );

	// IMPORTANT: Initial Deploy.
	pru.deploy( config, cwd, debug );

	console.log( PSVG_CONSOLE_NAME + " Deploy Complete." );

	runFunc();
	
}
