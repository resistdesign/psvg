
/**
 * @info - Allows a group to act as a container for objects. IMPORTANT: By default, all **groups** are given the `p-layout-container` tag by the compiler.
 * */

angular.module( "PSVG" )
	.directive( "pLayoutContainer", [
		
		"pLayoutUpdater", "psvgEventTypes", "isSet", "psvgConstants",
		function( pLayoutUpdater, psvgEventTypes, isSet, psvgConstants ){
			
			return {
				
				restrict: "A",
				link: function( scope, element, attrs ){

					var thisDispatcher = {};

					// *** Setup Children ***
					
					/**
					 * @setting nothing p-flow - Allow the layout of the child objects to be controlled by HTML/CSS normally.
					 * */
					
					var flow = isSet( attrs.pFlow );
					
					var setupFlow = function(){

						element.children().each( function( index ){

							var child = angular.element( this );
							
							// Set the positioning type for the child element.
							var lastChildPos = child.css( "position" );
							child.css( "position", "relative" );
							
							// TRICKY: Apply the p-flow-element attribute to prevent p-layout-box from setting the css position type.
							child.attr( psvgConstants.FLOW_ELEMENT_ATTR, "" );
							
							if( lastChildPos !== "relative" ){
								
								// IMPORTANT: Remove x, y, r and b to allow the child element to flow.
								child.attr( "x", "" );
								child.attr( "y", "" );
								child.attr( "r", "" );
								child.attr( "b", "" );

								child.css( "left", "" );
								child.css( "top", "" );
								child.css( "right", "" );
								child.css( "bottom", "" );
								
								child.trigger( psvgEventTypes.LAYOUT_CHANGED, thisDispatcher );
								
							}

						} );
						
					};

					if( flow ) setupFlow();
					
					// *** Manage Children ***
					
					pLayoutUpdater( scope, element, function(){

						if( flow ) setupFlow();
						
						return true;
						
					}, thisDispatcher );
					
				}
				
			};
			
		}
		
	] );
