
// Check for updates.

( function(){

	function sendRequest(url,callback,errorCallback,postData) {
		var req = createXMLHTTPObject();
		if (!req) return;
		var method = (postData) ? "POST" : "GET";
		req.open(method,url,true);
		if (postData)
			req.setRequestHeader('Content-type','application/x-www-form-urlencoded; charset=UTF-8');
		req.onreadystatechange = function () {
			if (req.readyState != 4) return;
			if (req.status != 200 && req.status != 304) {
				errorCallback(req);
				return;
			}
			callback(req);
		}
		if (req.readyState == 4) return;
		req.send(postData);
	}

	var XMLHttpFactories = [
		function () {return new XMLHttpRequest()},
		function () {return new ActiveXObject("Msxml2.XMLHTTP")},
		function () {return new ActiveXObject("Msxml3.XMLHTTP")},
		function () {return new ActiveXObject("Microsoft.XMLHTTP")}
	];

	function createXMLHTTPObject() {
		var xmlhttp = false;
		for (var i=0;i<XMLHttpFactories.length;i++) {
			try {
				xmlhttp = XMLHttpFactories[i]();
			}
			catch (e) {
				continue;
			}
			break;
		}
		return xmlhttp;
	}
	
	var lastUpdated = -1;
	
	// *** Update Interval ***
	var updateCheckInterval = 1000;
	
	var checkForUpdates = function(){
		
		sendRequest( "/AUTO_RELOAD_CHECK", function( req ){
			
			var newTime = parseInt( req.response );
			
			if( lastUpdated === -1 ){
				
				lastUpdated = newTime;
				
			}
			
			if( newTime > lastUpdated ){
				
				// Refresh!
				window.location.reload( true );
				
			}else{
				
				setTimeout( checkForUpdates, updateCheckInterval );
				
			}

		}, function( req ){

			setTimeout( checkForUpdates, updateCheckInterval );
			
		} );

	};
	
	setTimeout( checkForUpdates, updateCheckInterval );
	
} )();
