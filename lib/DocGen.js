
/**
 * @info - Convert JavaScript Comments To Documentation.
 */

// *** Imports ***

var fs = require( "fs" );
var wrench = require( "wrench" );
var pathUtils = require( "path" );
var pub = require( "./Publicity.js" );
var jsu = require( "./JSUtils.js" );

// *** Properties ***

exports.docCommentRegex = new RegExp( "/\\\*\\\*[^\\\*]((\\\r|\\\n|.)*?)\\\*/", "gm" );

exports.docFileExt = "md";
exports.readmeFileName = "README" + "." + exports.docFileExt;

exports.fileNameProperty = "__FILE_NAME__";

exports.INTERNAL_TAG = "INTERNAL";

// *** Helper Methods ***

exports.consumeEnds = function( line ){

	if( !line ) return line;

	var endChars = [ "\t", "/", "*", " ", "\r", "\n" ];

	while( line && endChars.indexOf( line.substr( 0, 1 ) ) !== -1 ){
		
		// TRICKY: Don't consume intended whitespace padding.
		if( line.indexOf( "* " ) === 0 ){

			line = line.substr( 2, line.length );
			
			break;
			
		}
		
		line = line.substr( 1, line.length );

	}

	if( !line ) return line;

	while( line && endChars.indexOf( line.substr( line.length - 1, 1 ) ) !== -1 ){

		line = line.substr( 0, line.length - 1 );

	}

	return line;

};

exports.getLineInfo = function( line ){

	if( !line || line.substr( 0, 1 ) != "@" ) return false;

	// Remove the @ symbol.
	line = line.substr( 1, line.length );

	var lineInfo = {};

	var infoSeg = "";

	while( line && line.length > 2 && line.substr( 0, 3 ) != " - " ){

		infoSeg += line.substr( 0, 1 );

		// Consume the next character.
		line = line.substr( 1, line.length );

	}

	if( line.substr( 0, 3 ) == " - " ){

		line = line.substr( 3, line.length );

		// Consume whitespace.
		var whiteSpaceChars = [ " ", "\t", "\r", "\n" ];

		while( line && whiteSpaceChars.indexOf( line.substr( 0, 1 ) ) !== -1 ){

			line = line.substr( 1, line.length );

		}

	}

	var segParts = infoSeg.split( " " );

	if( segParts.length > 0 ){

		lineInfo.type = segParts.shift();

		for( var s = 0; s < segParts.length; s++ ){

			var seg = segParts[ s ];

			if( seg ){

				if( "undefined" == typeof( lineInfo.meta ) ) lineInfo.meta = [];

				lineInfo.meta.push( seg );

			}

		}

	}
	
	var newLine = line;
	
	var newLineRows = [];
	
	var lineRows = newLine.split( "\n" );
	
	var lineHasSubInfo = false;
	
	var lastSubLineInfo;
	
	for( var l = 0; l < lineRows.length; l++ ){
		
		var lineRow = lineRows[ l ];
		
		var lineRowIsMeta = lineRow && lineRow.substr( 0, 1 ) == "@" && lineRow.indexOf( " - " ) !== -1;
		
		if( lineRow && ( lineHasSubInfo || lineRowIsMeta ) ){
			
			lineHasSubInfo = true;
			
			if( !lineInfo.subInfo ){
				
				lineInfo.subInfo = {};
				
			}
			
			var subLineInfo = exports.getLineInfo( lineRow );
			
			if( !lineRowIsMeta ){
				
				lastSubLineInfo.line += "\n" + subLineInfo.line;
				
			}else{

				if( !lineInfo.subInfo[ subLineInfo.type ] ){

					lineInfo.subInfo[ subLineInfo.type ] = [];

				}

				lineInfo.subInfo[ subLineInfo.type ].push( subLineInfo );
				
				lastSubLineInfo = subLineInfo;
				
			}
			
		}else{
			
			lineHasSubInfo = false;
			
			newLineRows.push( lineRow );
			
		}
		
	}
	
	if( line ) lineInfo.line = newLineRows.join( "\n" );

	return lineInfo;

};

exports.getViewFilters = function( absoluteSrcPath ){
	
	return pub.getViewFilters( absoluteSrcPath );

};

exports.getCommentDocMap = function( commentData ){
	
	var docMap = {};
	
	if( jsu.isArray( commentData ) ){
		
		for( var i = 0; i < commentData.length; i++ ){
			
			var currData = commentData[ i ];
			
			if( !jsu.isUndefined( currData.type ) ){
				
				if( jsu.isUndefined( docMap[ currData.type ] ) ) docMap[ currData.type ] = [];
				
				docMap[ currData.type ].push( currData );
				
			}
			
		}
		
	}
	
	return docMap;
	
};

exports.mergeCommentDocMaps = function( docMap1, docMap2 ){
	
	if( jsu.isType( docMap1, "object" ) && jsu.isType( docMap2, "object" ) ){
		
		for( var k in docMap2 ){
			
			if( jsu.isArray( docMap2[ k ] ) ){

				if( !jsu.isArray( docMap1[ k ] ) ) docMap1[ k ] = [];
				
				var docMap1Arr = docMap1[ k ];
				var docMap2Arr = docMap2[ k ];
				
				for( var i = 0; i < docMap2Arr.length; i++ ){
					
					docMap1Arr.push( docMap2Arr[ i ] );
					
				}
				
			}else{
				
				docMap1[ k ] = docMap2[ k ];
				
			}
			
		}
		
		return docMap1;
		
	}
	
	return {};
	
};

// *** API Methods ***

exports.getCommentData = function( content ){

	var matches = content.match( exports.docCommentRegex );
	matches = matches ? matches : [];

	var lines = [];

	for( var i = 0; i < matches.length; i++ ){

		var line = matches[ i ];

		var lineParts = line.split( "\n" );

		var newLineParts = [];

		for( var j = 0; j < lineParts.length; j++ ){

			var part = exports.consumeEnds( lineParts[ j ] );

			newLineParts.push( part );

		}

		line = newLineParts.join( "\n" );

		var lineInfo = exports.getLineInfo( exports.consumeEnds( line ) );

		if( lineInfo ) lines.push( lineInfo );

	}

	return lines;

};

exports.makeDocs = function( absoluteSrcPathList, docPath, fileExtList, viewFilterPath, docTemplateRoot, fileTemplateName, readmeTemplateName ){
	
	// Setup Publicity.
	pub.templateRoot = docTemplateRoot;
	pub.filters = exports.getViewFilters( viewFilterPath );
	
	// Clean target docPath.
	if( fs.existsSync( docPath ) ){
		
		wrench.rmdirSyncRecursive( docPath );
		
	}
	
	var fullDocMap = {};
	
	for( var f = 0; f < absoluteSrcPathList.length; f++ ){
		
		var absoluteSrcPath = absoluteSrcPathList[ f ];
		
		// Get file list.
		var fileList = wrench.readdirSyncRecursive( absoluteSrcPath );
		
		for( var i = 0; i < fileList.length; i++ ){

			var currFile = fileList[ i ];
			var currFullFile = absoluteSrcPath + pathUtils.sep + currFile;

			// Don't process directories.
			if( fs.statSync( currFullFile ).isDirectory() ) continue;

			// Only process file extensions in the fileExtList.
			var fileExt = jsu.getFullFileExt( currFile );
			if( jsu.isArray( fileExtList ) && fileExtList.indexOf( fileExt ) === -1 ) continue;

			var fileContent = fs.readFileSync( currFullFile, "utf8" );

			// Comment Data.
			var commentData = exports.getCommentDocMap( exports.getCommentData( fileContent ) );

			// Add relative file path to comment data.
			commentData[ exports.fileNameProperty ] = currFile.substr( 0, ( currFile.length - fileExt.length ) - 1 );
			
			var docTargetFile = docPath + pathUtils.sep + currFile;

			var targetFilePathBase = docTargetFile.substr( 0, ( docTargetFile.length - fileExt.length ) - 1 );

			// Setup TOC Map.
			if( jsu.isUndefined( fullDocMap[ targetFilePathBase ] ) ) fullDocMap[ targetFilePathBase ] = {};
			fullDocMap[ targetFilePathBase ] = exports.mergeCommentDocMaps( fullDocMap[ targetFilePathBase ], commentData );
			
		}
		
	}
	
	// Save all doc files.
	
	for( var d in fullDocMap ){

		// Build Document.
		var currDocFileData = fullDocMap[ d ];
		
		// Avoid INTERNAL files.
		if( jsu.isType( currDocFileData, "object" ) && jsu.isArray( currDocFileData.tags ) ){
			
			var skipInternal = false;
			
			for( var t = 0; t < currDocFileData.tags.length; t++ ){
				
				var currTag = currDocFileData.tags[ t ];
				
				if( jsu.isType( currTag, "object" ) && jsu.isType( currTag.line, "string" ) ){
					
					if( currTag.line.indexOf( exports.INTERNAL_TAG ) != -1 ){
						
						skipInternal = true;
						
						break;
						
					}
					
				}
				
			}
			
			if( skipInternal ){
				
				delete fullDocMap[ d ];
				
				continue;
				
			}
			
		}
		
		var fileDoc = pub.buildSingleView( currDocFileData, fileTemplateName, d );

		// Save the doc file.
		wrench.mkdirSyncRecursive( pathUtils.dirname( d ) );
		fs.writeFileSync( d + "." + exports.docFileExt, fileDoc );

	}
	
	// Process and Save README.
	
	var readmeDoc = pub.buildSingleView( fullDocMap, readmeTemplateName, 0 );
	
	var readmePath = docPath + pathUtils.sep + exports.readmeFileName;

	wrench.mkdirSyncRecursive( pathUtils.dirname( readmePath ) );
	fs.writeFileSync( readmePath, readmeDoc );
	
};
