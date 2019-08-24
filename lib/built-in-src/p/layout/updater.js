
/**
 * @name - pLayoutUpdater
 * */

/**
 * @info - A helper factory method to manage the lifecycle events for an element and it's children.
 * 
 * > This method will be responsible for the following:
 * > <br>
 * > 1. Notifying the caller when child elements should be laid out.
 * > <br>
 * > 2. Notifying child elements that they have been laid out by dispatching the `psvgEventTypes.LAYOUT_CHANGED` event on each child.
 * */

/**
 * @tags - Code
 * */

angular.module( "PSVG" )
	.factory( "pLayoutUpdater", [
		
		"psvgEventTypes",
		function( psvgEventTypes ){
			
			/**
			 * @api-function Function pLayoutUpdater - Setup a scope and element for handling various layout events and requests.
			 * Returns a reference to a function for invalidating the layout of the supplied element.
			 * 
			 * @arg Scope scope - The scope to listen to for the "$destroy" event for the purpose of tearing down all listeners/watchers.
			 * @arg elementReference element - The element reference that contains children and that will be watched/listened to for layout events.
			 * @arg function layoutFunction - A function that will be called when the container's children should be laid out. IMPORTANT: `layoutFunction` **MUST** return `true` if the container's children are to be notified of layout changes.
			 * @arg object dispatcher - A unique dispatcher object to accompany the `psvgEventTypes.LAYOUT_CHANGED` event. (Important to avoid event triggered layout recursion.)
			 * */
			
			var updateLayout = function( scope, element, layoutFunction, dispatcher ){
				
				var thisDispatcher = dispatcher ? dispatcher : {};
				
				// *** Update Layout And Notify Children Of Layout Changes ***

				var layoutNeedsUpdate = false;

				var updateLayout = function(){
					
					var layoutChanged = false;
					
					if( "function" === typeof layoutFunction ){
						
						layoutChanged = layoutFunction();
						
					}
					
					if( layoutChanged ){
						
						element.children().each( function( index ){

							var child = angular.element( this );

							child.trigger( psvgEventTypes.LAYOUT_CHANGED, thisDispatcher );

						} );

					}
					
					layoutNeedsUpdate = false;

				};

				var invalidateLayout = function(){

					// TRICKY: Don't resize right away, collect events/requests and then do the layout ONCE.
					if( !layoutNeedsUpdate ){

						layoutNeedsUpdate = true;

						setTimeout( updateLayout, 0 );

					}

				};

				var onLayoutChanged = function( event, dispatcher ){

					if( dispatcher === thisDispatcher ) return;

					if( !element.is( event.target ) ){
						
						event.stopPropagation();

					}

					invalidateLayout();

				};

				element.bind( psvgEventTypes.LAYOUT_CHANGED, onLayoutChanged );

				// *** Destroy ***

				scope.$on( "$destroy", function(){

					element.unbind( psvgEventTypes.LAYOUT_CHANGED, onLayoutChanged );

				} );
				
				// IMPORTANT: Return the `invalidateLayout` function for direct use in implementing directives.
				
				return invalidateLayout;

			};
			
			return updateLayout;
			
		}
		
	] );
