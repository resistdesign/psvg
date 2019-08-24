
/**
 * @info - Resize the `height` of a `textarea` to fit the text it contains.
 * */

angular.module( "PSVG" )
	.directive( "pLayoutExpandTextarea", [

		"psvgEventTypes",
		function( psvgEventTypes ){

			return {

				restrict: "A",
				link: function( scope, element, attrs ){

					var thisDispatcher = {};

					// *** Listen ***

					var layoutChanged = false;

					var eventTypes = "input propertychange";

					var updateLayout = function(){

						layoutChanged = false;

						element.attr( "height", "" );
						element.css( "height", "" );

						var borderT = parseFloat( String( element.css( "border-top-width" ) ).split( "px" ).join( "" ) );
						var borderB = parseFloat( String( element.css( "border-bottom-width" ) ).split( "px" ).join( "" ) );

						var eleHeight = parseFloat( element.height() );

						var scrollHeight = parseFloat( element[ 0 ].scrollHeight );
						var clientHeight = parseFloat( element[ 0 ].clientHeight );
						var newHeight = scrollHeight + ( borderT + borderB );

						var padTop = parseFloat( String( element.css( "padding-top" ) ).split( "px" ).join( "" ) );
						var padBottom = parseFloat( String( element.css( "padding-bottom" ) ).split( "px" ).join( "" ) );

						// TRICKY: Include the padding in the new height if it is NOT considered in the scroll height.
						if( element.innerHeight() != clientHeight ){

							newHeight += padTop + padBottom;

						}

						if( eleHeight !== newHeight ){

							// TRICKY: Let the HTML rendering system catch up before applying layout changes.
							setTimeout( function(){

								element.attr( "height", newHeight );
								element.css( "height", newHeight + "px" );

								setTimeout( function(){

									element.trigger( psvgEventTypes.LAYOUT_CHANGED, thisDispatcher );

								}, 0 );

							}, 0 );

						}

					};

					var onKeyUp = function(){

						if( !layoutChanged ){

							layoutChanged = true;

							setTimeout( updateLayout, 500 );

						}

					};

					element.bind( eventTypes, onKeyUp );

					// *** Destroy ***

					scope.$on( "$destroy", function(){

						element.unbind( eventTypes, onKeyUp );

					} );

					// *** Initialize (VERY TRICKY TIMING!!!) ***

					var setup = function(){

						if( !element.is( ":visible" ) ){

							return;

						}

						element.unbind( psvgEventTypes.LAYOUT_CHANGED, setup );

						onKeyUp();

					};

					setTimeout( function(){

						element.bind( psvgEventTypes.LAYOUT_CHANGED, setup );

					}, 0 );

					onKeyUp();

				}

			};

		}

	] );