
/**
 * @info - Expand a group to the size of it's content either horizontally, vertically or both.
 * */

angular.module( "PSVG" )
	.directive( "pLayoutExpand", [

		"pLayoutUpdater", "psvgEventTypes", "watchAttrSet", "isSet", "lastAttrValue",
		function( pLayoutUpdater, psvgEventTypes, watchAttrSet, isSet, lastAttrValue ){
			
			var attrSet = [
				
				/**
				 * @setting nothing h - Add this tag to expand the object horizontally.
				 * */
				
				"h",
				
				/**
				 * @setting nothing v - Add this tag to expand the object vertically.
				 * */
				
				"v",
				
				/**
				 * @setting nothing hv - Add this tag to expand the object in both directions.
				 * */
				
				"hv",
				
				/**
				 * @setting number pad-r - Adds padding to the right side of the object in addition to the expanded size.
				 * */
				
				"padR",
				
				/**
				 * @setting number pad-b - Adds padding to the bottom of the object in addition to the expanded size.
				 * */
				
				"padB",
				
				/**
				 * @setting nothing scroll-h - Add this tag to allow horizontal scrolling.
				 * */
				
				"scrollH",
				
				/**
				 * @setting nothing scroll-v - Add this tag to allow vertical scrolling.
				 * */
				
				"scrollV",
				
				/**
				 * @setting nothing scroll - Add this tag to allow horizontal and vertical scrolling.
				 * */
				
				"scroll"
				
			];
			
			/**
			 * @setting nothing expand-exclude - IMPORTANT: Add this tag to an object **within** the expanding object to exclude it from the expanded size.
			 * */
			
			var excludeAttr = "[expand-exclude]";
			
			return {
				
				restrict: "A",
				link: function( scope, element, attrs ){
					
					// *** Get Expansion Options ***
					
					var getOptions = function(){
						
						var options = {
							
							h: isSet( attrs.h ),
							v: isSet( attrs.v ),
							
							padR: isSet( attrs.padR ) ? parseFloat( attrs.padR ) : 0,
							padB: isSet( attrs.padB ) ? parseFloat( attrs.padB ) : 0,
							
							scrollH : isSet( attrs.scrollH ),
							scrollV : isSet( attrs.scrollV )
							
						};
						
						var hv = isSet( attrs.hv );
						
						options.h = hv ? true : options.h;
						options.v = hv ? true : options.v;
						
						var scroll = isSet( attrs.scroll );

						options.scrollH = scroll ? true : options.scrollH;
						options.scrollV = scroll ? true : options.scrollV;
						
						return options;
						
					};
					
					// *** Handle Element Expansion ***
					
					var thisDispatcher = {};
					
					var oriScrollH = element.css( "overflow-x" );
					var oriScrollV = element.css( "overflow-y" );
					
					var updateLayout = function(){
						
						// Get options.
						var opts = getOptions();
						
						// Unset scroll positions.
						if( opts.h && !opts.scrollH ) element.scrollLeft( 0 );
						if( opts.v && !opts.scrollV ) element.scrollTop( 0 );
						
						// Calculate the expanded size.
						var newWidth = 0;
						var newHeight = 0;
						
						element.children().not( excludeAttr ).filter( ":visible" ).each( function( index ){
							
							var child = angular.element( this );
							
							var childPos = child.position();
							
							newWidth = Math.max( newWidth, childPos.left + child.outerWidth() );
							newHeight = Math.max( newHeight, childPos.top + child.outerHeight() );
							
						} );
						
						// Add padding.
						newWidth += opts.padR;
						newHeight += opts.padB;
						
						// Check if the layout has changed.
						var layoutChanged = false;
						
						// Expand.
						if( opts.h ){

							element.attr( "width", newWidth );
							element.css( "width", newWidth );
							
							element.css( "overflow-x", opts.scrollH ? "" : "hidden" );
							
							var widthChanged = lastAttrValue( element, "width", newWidth );
							
							if( !layoutChanged ) layoutChanged = widthChanged;
							
						}else{

							element.css( "overflow-x", oriScrollH );
							
						}
						
						if( opts.v ){

							element.attr( "height", newHeight );
							element.css( "height", newHeight );

							element.css( "overflow-y", opts.scrollV ? "" : "hidden" );
							
							var heightChanged = lastAttrValue( element, "height", newHeight );
							
							if( !layoutChanged ) layoutChanged = heightChanged;
							
						}else{

							element.css( "overflow-y", oriScrollV );
							
						}
						
						if( layoutChanged ){

							// Notify the layout system of changes.
							element.trigger( psvgEventTypes.LAYOUT_CHANGED, thisDispatcher );

						}
						
						return layoutChanged;
						
					};
					
					// *** Watch ***

					watchAttrSet( scope, attrs, attrSet, updateLayout );
					
					// *** Hook Into The Layout System ***
					
					pLayoutUpdater( scope, element, updateLayout, thisDispatcher );
					
				}
				
			};
			
		}
		
	] );
