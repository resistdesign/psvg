
/**
 * @info - Layout the contents of a group in a row, a column, multiple rows or multiple columns.
 * */

angular.module( "PSVG" )
	.directive( "pLayoutDirection", [
		
		"pLayoutUpdater", "watchAttrSet", "psvgEventTypes", "isSet", "lastAttrValue", "parseLayoutAttr", "isPercentage", "psvgConstants",
		function( pLayoutUpdater, watchAttrSet, psvgEventTypes, isSet, lastAttrValue, parseLayoutAttr, isPercentage, psvgConstants ){
			
			var directionAttr = "pLayoutDirection";
			
			var attrSet = [
				
				/**
				 * @setting text p-layout-direction - The direction in which to layout the contents of the group.
				 * <br>
				 * Options: `row`, `col`, `rows` or `cols`. Default: `col`
				 * */
				
				directionAttr,
				
				/**
				 * @setting number pad-l - The left padding for the group.
				 * */
				
				"padL",
				
				/**
				 * @setting number pad-t - The top padding for the group.
				 * */
				
				"padT",
				
				/**
				 * @setting number pad-r - The right padding for the group.
				 * */
				
				"padR",
				
				/**
				 * @setting number pad-b - The bottom padding for the group.
				 * */
				
				"padB",
				
				/**
				 * @setting number pad - The padding for all sides of the group. This will override all other padding.
				 * */
				
				"pad",
				
				/**
				 * @setting number gap-h - The horizontal space between child objects.
				 * */
				
				"gapH",
				
				/**
				 * @setting number gap-v - The vertical space between child objects.
				 * */
				
				"gapV",
				
				/**
				 * @setting number gap - The vertcial and horizontal space between child objects. This will override both gaps.
				 * */
				
				"gap"
				
			];
			
			/**
			 * @setting nothing direction-exclude - IMPORTANT: Add this tag to an object **within** the group to exclude it from the direction layout.
			 * */
			
			var excludeAttr = "[direction-exclude]";
			
			var defaultDir = "col";
			
			// *** Layout Helper Methods ***
			
			var elementPositionChanged = function( element, newX, newY ){
				
				var xChanged = lastAttrValue( element, "x", newX );
				var yChanged = lastAttrValue( element, "y", newY );
				
				return xChanged || yChanged;
				
			};
			
			var calcElementLayout = function( value, altValue, valueInc, altValueInc, gap, altGap, min, nextAltMin, max ){

				var obj = {

					"value": value,
					"altValue": altValue,
					nextValue: 0,
					nextAltValue: 0,
					altMin: Math.max( nextAltMin, altValue + altValueInc + altGap )

				};
				
				if( value > max || value + valueInc > max ){
					
					obj.value = min;
					obj.altValue = nextAltMin;
					
				}
				
				obj.nextValue = obj.value + valueInc + gap;
				obj.nextAltValue = obj.altValue;
				
				return obj;
				
			};

			var layouts = {

				row: function( x, y, width, height, hGap, vGap, minX, minY, nextMin, maxWidth, maxHeight ){

					var obj = calcElementLayout( x, y, width, height, hGap, vGap, minX, Math.max( minY, nextMin ), Infinity );

					return {

						x: obj.value,
						y: obj.altValue,
						nX: obj.nextValue,
						nY: obj.nextAltValue,
						nextMin: obj.altMin

					};

				},
				col: function( x, y, width, height, hGap, vGap, minX, minY, nextMin, maxWidth, maxHeight ){

					var obj = calcElementLayout( y, x, height, width, vGap, hGap, minY, Math.max( minX, nextMin ), Infinity );

					return {

						x: obj.altValue,
						y: obj.value,
						nX: obj.nextAltValue,
						nY: obj.nextValue,
						nextMin: obj.altMin

					};

				},
				rows: function( x, y, width, height, hGap, vGap, minX, minY, nextMin, maxWidth, maxHeight ){

					var obj = calcElementLayout( x, y, width, height, hGap, vGap, minX, Math.max( minY, nextMin ), maxWidth );

					return {

						x: obj.value,
						y: obj.altValue,
						nX: obj.nextValue,
						nY: obj.nextAltValue,
						nextMin: obj.altMin

					};

				},
				cols: function( x, y, width, height, hGap, vGap, minX, minY, nextMin, maxWidth, maxHeight ){

					var obj = calcElementLayout( y, x, height, width, vGap, hGap, minY, Math.max( minX, nextMin ), maxHeight );

					return {

						x: obj.altValue,
						y: obj.value,
						nX: obj.nextAltValue,
						nY: obj.nextValue,
						nextMin: obj.altMin

					};

				}

			};

			return {
				
				restrict: "A",
				link: function( scope, element, attrs ){
					
					// *** Get Options ***
					
					var getOptions = function(){
						
						var options = {
							
							pad: {
								
								l: isSet( attrs.padL ) ? parseFloat( attrs.padL ) : 0,
								t: isSet( attrs.padT ) ? parseFloat( attrs.padT ) : 0,
								r: isSet( attrs.padR ) ? parseFloat( attrs.padR ) : 0,
								b: isSet( attrs.padB ) ? parseFloat( attrs.padB ) : 0
								
							},
							gap: {
								
								h: isSet( attrs.gapH ) ? parseFloat( attrs.gapH ) : 0,
								v: isSet( attrs.gapV ) ? parseFloat( attrs.gapV ) : 0
								
							}
							
						};
						
						if( isSet( attrs.pad ) ){
							
							var pad = parseFloat( attrs.pad );
							
							options.pad.l = pad;
							options.pad.t = pad;
							options.pad.r = pad;
							options.pad.b = pad;
							
						}
						
						if( isSet( attrs.gap ) ){
							
							var gap = parseFloat( attrs.gap );
							
							options.gap.h = gap;
							options.gap.v = gap;
							
						}
						
						return options;
						
					};
					
					// *** Update Layout ***
					
					var thisDispatcher = {};
					
					var updateLayout = function(){
						
						// Get direction.
						var dirAttr = attrs[ directionAttr ];
						var direction = isSet( dirAttr ) ? dirAttr : defaultDir;
						
						// Get options.
						var opts = getOptions();
						
						// Check for layout changes.
						var layoutChanged = false;
						
						// Initial values.
						var initX = opts.pad.l;
						var initY = opts.pad.t;
						
						var currX = initX;
						var currY = initY;
						
						var nextMin = 0;
						
						var elementNode = element[ 0 ];
						
						var innerWidth = elementNode.clientWidth - opts.pad.r;
						var innerHeight = elementNode.clientHeight - opts.pad.b;
						
						var hGap = opts.gap.h;
						var vGap = opts.gap.v;
						
						// Children.
						var children = element.children().not( excludeAttr ).filter( ":visible" );
						
						if( "function" !== typeof layouts[ direction ] ) direction = defaultDir;
						
						var dirFunc = layouts[ direction ];
						
						/**
						 * @setting nothing p-keep-h - Keep the horizontal position of each child.
						 * <br>
						 * Usage: `p-keep-h`
						 * */
						
						var keepHPos = isSet( attrs.pKeepH );

						/**
						 * @setting nothing p-keep-v - Keep the vertical position of each child.
						 * <br>
						 * Usage: `p-keep-v`
						 * */

						var keepVPos = isSet( attrs.pKeepV );
						
						if( direction === "row" ){

							var remainingWidth = element[ 0 ].clientWidth;
							
							var numberOfPercentWidthChildren = 0;
							
							children.each( function( index ){

								var child = angular.element( this );

								var childScope = child.scope();

								var directChildWidth = child.attr( "width" );
								var childWidth = parseLayoutAttr( childScope, child, "width" );
								
								if( !isPercentage( directChildWidth ) ){

									remainingWidth -= childWidth;

								}else{
									
									numberOfPercentWidthChildren++;
									
								}

							} );
							
							remainingWidth -= ( ( children.length - 1 ) * hGap ) + opts.pad.l;
							
							var widthPerPercentChild = remainingWidth / numberOfPercentWidthChildren;
							
							children.each( function( index ){
								
								var child = angular.element( this );

								var directChildWidth = child.attr( "width" );
								
								if( isPercentage( directChildWidth ) ){
									
									var percentageWidth = parseFloat( directChildWidth.split( "%" ).join( "" ) );
									var widthRatio = percentageWidth / 100;
									
									child.attr( psvgConstants.PERCENT_WIDTH_ATTR, "" );
									child.css( "width", ( widthPerPercentChild * widthRatio ) + "px" );
									
								}
								
							} );
							
						}

						if( direction === "col" ){

							var remainingHeight = element[ 0 ].clientHeight;
							
							var numberOfPercentHeightChildren = 0;
							
							children.each( function( index ){

								var child = angular.element( this );

								var childScope = child.scope();
								
								var directChildHeight = child.attr( "height" );
								var childHeight = parseLayoutAttr( childScope, child, "height" );

								if( !isPercentage( directChildHeight ) ){
									
									remainingHeight -= childHeight;
									
								}else{
									
									numberOfPercentHeightChildren++;
									
								}

							} );
							
							remainingHeight -= ( ( children.length - 1 ) * vGap ) + opts.pad.t;

							var heightPerPercentChild = remainingHeight / numberOfPercentHeightChildren;

							children.each( function( index ){

								var child = angular.element( this );

								var directChildHeight = child.attr( "height" );

								if( isPercentage( directChildHeight ) ){

									var percentageHeight = parseFloat( directChildHeight.split( "%" ).join( "" ) );
									var heightRatio = percentageHeight / 100;

									child.attr( psvgConstants.PERCENT_HEIGHT_ATTR, "" );
									child.css( "height", ( heightPerPercentChild * heightRatio ) + "px" );

								}

							} );

						}
						
						// Do layout.
						children.each( function( index ){

							var child = angular.element( this );
							
							// x, y, width, height, hGap, vGap, minX, minY, nextMinX, nextMinY, maxWidth, maxHeight
							var coordinates = dirFunc( currX, currY, child.outerWidth(), child.outerHeight(), hGap, vGap, initX, initY, nextMin, innerWidth, innerHeight );

							if( !keepHPos ){

								child.attr( "x", coordinates.x );
								child.css( "left", coordinates.x + "px" );
								
							}
							
							if( !keepVPos ){

								child.attr( "y", coordinates.y );
								child.css( "top", coordinates.y + "px" );
								
							}
							
							var childScope = child.scope();
							
							var checkX = keepHPos ? parseLayoutAttr( childScope, child, "x" ) : coordinates.x;
							var checkY = keepVPos ? parseLayoutAttr( childScope, child, "y" ) : coordinates.y;
							
							var childMoved = elementPositionChanged( child, checkX, checkY );
							
							if( childMoved ){
								
								layoutChanged = true;
								
								child.trigger( psvgEventTypes.LAYOUT_CHANGED, thisDispatcher );
								
							}
							
							currX = coordinates.nX;
							currY = coordinates.nY;

							nextMin = coordinates.nextMin;
							
						} );
						
						if( layoutChanged ){
							
							element.trigger( psvgEventTypes.LAYOUT_CHANGED, thisDispatcher );
							
						}
						
						return false;
						
					};
					
					// *** Watch ***

					watchAttrSet( scope, element, attrs, attrSet );
					
					// *** Listen ***

					pLayoutUpdater( scope, element, updateLayout, thisDispatcher );
					
				}
				
			};
			
		}
		
	] );
