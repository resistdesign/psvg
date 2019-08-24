
exports.directive = function( node ){
	
	if( !node ) node = {};
	if( !node.attr ) node.attr = {};
	node.attr.placeholder = "Test Label";
	
};
