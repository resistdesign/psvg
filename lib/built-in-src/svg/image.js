
angular.module( "PSVG" )
	.directive( "svgImage", [
		
		"isSet",
		function( isSet ){
			
			return {
				
				restrict: "A",
				link: function( scope, element, attrs ){
					
					var setup = function(){
						
						// TRICKY: Wait until the element is visible to setup the size and position.
						if( element.is( ":visible" ) ){

							// *** Set size and position. ***

							var svgRef = element.find( "svg" ).first();
							var groupRef = svgRef.find( "g" ).first();

							var bBox = groupRef[ 0 ].getBBox();

							element.css( "position", "absolute" );
							element.css( "overflow", "show" );

							element.css( "width", bBox.width );
							element.css( "height", bBox.height );
							
							/**
							 * @setting number image-pad - The number of additional pixel to show outside eof the SVG canvas area. Default: `0`
							 * <br>
							 * Used when an object has a stroke that should not be cropped by the edge of the SVG image.
							 * */
							
							var padding = isSet( attrs.imagePad ) ? parseFloat( attrs.imagePad ) : 0;
							var sizePad = padding * 2;
							var marginOffset = padding * -1;

							bBox = {

								x: bBox.x - padding,
								y: bBox.y - padding,
								width: bBox.width + sizePad,
								height: bBox.height + sizePad

							};

							// Set the SVG element size.
							svgRef.css( "position", "absolute" );
							svgRef.css( "left", marginOffset );
							svgRef.css( "top", marginOffset );
							svgRef.attr( "width", bBox.width );
							svgRef.css( "width", bBox.width );
							svgRef.attr( "height", bBox.height );
							svgRef.css( "height", bBox.height );

							// *** Translate the inner group to reset the image origin. ***

							var offsetX = bBox.x * -1;
							var offsetY = bBox.y * -1;

							groupRef.attr( "transform", "translate(" + offsetX + "," + offsetY + ")" );
							
						}else{
							
							setTimeout( setup, 100 );
							
						}
						
					};
					
					setup();
					
				}
				
			};
			
		}
		
	] );
