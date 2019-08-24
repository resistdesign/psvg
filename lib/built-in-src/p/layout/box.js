
/**
 * @info - Add advanced layout functionality to an object. IMPORTANT: By default, all objects are given the `p-layout-box` tag by the compiler.
 * */

/**
 * @setting number/expression p-x - The horizontal position of the object.
 * */

/**
 * @setting number/expression p-y - The vertical position of the object.
 * */

/**
 * @setting number/expression p-r - The horizontal position of the **right** side of the object.
 * */

/**
 * @setting number/expression p-b - The vertical position of the **bottom** of the object.
 * */

/**
 * @setting number/expression p-width - The width of the object.
 * */

/**
 * @setting number/expression p-height - The height of the object.
 * */

/**
 * @info - Special Values:
 * Layout properties can be bound to values in the current view or component in addition to a few special values:
 * <pre>
 * 	1. `parentWidth` - The width of the parent group.
 * 	2. `parentHeight` - The height of the parent group.
 * 	3. `parentCenter` - The center of the parent group.
 * 	4. `center`: A position to offset the object to align its center with the center of its parent group.
 * 	5. `thisWidth` - The width of the object.
 * 	6. `thisHeight` - The height of the object.
 * 	7. `thisCenter` - The center of the object.
 * </pre>
 * It is also possible to use some basic math, for example: `p-x="(parentWidth*0.75)-50"`
 * 
 * */

angular.module( "PSVG" )
	.directive( "pLayoutBox", [
		
		"pLayoutUpdater", "psvgEventTypes", "$window", "isSet", "watchAttrSet", "lastAttrValue", "psvgConstants", "parseLayoutAttr", "isPercentage",
		function( pLayoutUpdater, psvgEventTypes, $window, isSet, watchAttrSet, lastAttrValue, psvgConstants, parseLayoutAttr, isPercentage ){
			
			var layoutAttrs = psvgConstants.LAYOUT_ATTRS;
			
			var attrToCSSMap = {
				
				x: "left",
				y: "top",
				r: "right",
				b: "bottom",
				width: "width",
				height: "height"
				
			};
			
			var positionAttrs = {
				
				x: 1,
				y: 1,
				r: 1,
				b: 1
				
			};
			
			return {
				
				restrict: "A",
				link: function( scope, element, attrs ){
					
					var thisDispatcher = {};
					
					// *** Update Layout ***
					
					var oriPos = element.css( "position" );
					if( !isSet( oriPos ) ) oriPos = "";
					
					var updateLayout = function(){
						
						// Set size and position based on layout attributes parsed with `parseLayoutAttr`.

						var flow = isSet( element.attr( psvgConstants.FLOW_ELEMENT_ATTR ) );
						
						var layoutChanged = false;
						var positionAttrSet = false;
						
						var newCSSValueMap = {};
						
						var percentWidthAttrSet = isSet( element.attr( psvgConstants.PERCENT_WIDTH_ATTR ) );
						var percentHeightAttrSet = isSet( element.attr( psvgConstants.PERCENT_HEIGHT_ATTR ) );
						
						for( var i = 0; i < layoutAttrs.length; i++ ){
							
							var currAttr = layoutAttrs[ i ];
							
							var directAttrValue = element.attr( currAttr );
							
							if( !isSet( directAttrValue ) ) continue;
							
							var isPositionAttr = positionAttrs[ currAttr ];
							
							if( isPositionAttr && flow ) continue;
							
							var newValue = parseLayoutAttr( scope, element, currAttr );

							var testValue = newValue;
							
							if( isPercentage( directAttrValue ) ){
								
								// TRICKY: Use a percentage value directly but save a testValue for layout change testing.
								newValue = directAttrValue;

							}
							
							if( !positionAttrSet && isPositionAttr && isSet( newValue ) && newValue !== "" ) positionAttrSet = true;
							
							var cssPropPostfix = isNaN( newValue ) || newValue === "" ? "" : "px";
							var cssValue = !isNaN( newValue ) ? parseInt( newValue ) : newValue;

							// IMPORTANT: Don't set width or height for the element if it is set by another layout system using percentages.
							if( !( currAttr == "width" && percentWidthAttrSet ) && !( currAttr == "height" && percentHeightAttrSet ) ){

								newCSSValueMap[ attrToCSSMap[ currAttr ] ] = cssValue + cssPropPostfix;
								
							}
							
							// Test the last set value of the current attribute.
							if( lastAttrValue( element, currAttr, testValue ) ){
								
								// Set the flag to dispatch the LAYOUT_CHANGED event.
								layoutChanged = true;
								
							}

						}
						
						element.css( newCSSValueMap );
						
						// IMPORTANT: Test for size changes.
						var widthTest = lastAttrValue( element, "size-width", element.width() );
						var heightTest = lastAttrValue( element, "size-height", element.height() );
						if( widthTest || heightTest ){

							// Set the flag to dispatch the LAYOUT_CHANGED event.
							layoutChanged = true;

						}
						
						if( !flow ) element.css( "position", ( positionAttrSet ? "absolute" : oriPos ) );
						
						// TRICKY: Manage the propagation of the resize event based on whether or not this element actually resized or moved.
						if( layoutChanged ) element.trigger( psvgEventTypes.LAYOUT_CHANGED, thisDispatcher );
						
					};

					// *** Listen ***
					
					var invalidateLayout = pLayoutUpdater( scope, element, updateLayout, thisDispatcher );
					
					// *** Watch ***

					watchAttrSet( scope, attrs, layoutAttrs, invalidateLayout );
					
					// *** Window ***
					
					var topLevelElement;
					
					if( element.parents( psvgConstants.LAYOUT_BOX_ATTR_SELECTOR ).length == 0 ){
						
						topLevelElement = angular.element( $window );
						
						topLevelElement.bind( "resize", invalidateLayout );
						
					}
					
					// *** Destroy ***
					
					var destroyLayoutTarget = element.parent();
					
					scope.$on( "$destroy", function(){
						
						if( topLevelElement ) topLevelElement.unbind( "resize", invalidateLayout );

						destroyLayoutTarget.trigger( psvgEventTypes.LAYOUT_CHANGED, thisDispatcher );
						
					} );
					
					// *** Initial Layout Event ***
					
					element.trigger( psvgEventTypes.LAYOUT_CHANGED, thisDispatcher );
					
				}
				
			};
			
		}
		
	] );	
