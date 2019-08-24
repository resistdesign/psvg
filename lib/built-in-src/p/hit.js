
/**
 * @info - Trigger a function (or expression) by clicking, pressing space or pressing enter on an object.
 * */

/**
 * @setting expression p-hit - The expression to trigger.
 * <br>
 * Usage: `p-hit="myHandler($event)"`
 * <br>
 * Available properties:
 * 	- `$event`: The event that triggered the hit.
 * */

angular.module( "PSVG" )
	.directive( "pHit", [
		
		"isSet",
		function( isSet ){
			
			return {
				
				restrict: "A",
				link: function( scope, element, attrs ){
					
					// *** Helper Methods ***
					
					var isExcluded = function( type ){
						
						/**
						 * @setting text p-hit-exclude - A comma separated list of event types to exclude from triggering a hit.
						 * <br>
						 * Options: `click`, `space` or `enter`
						 * <br>
						 * Usage: `p-hit-exclude="space,enter"`
						 * */
						
						var typesString = attrs.pHitExclude;
						
						if( "string" !== typeof typesString || typesString === "" ) return false;
						
						var typeList = typesString.split( ", " ).join( "," ).split( "," );
						
						return angular.element.inArray( type, typeList ) !== - 1;
						
					};
					
					var onHit = function( type, event ){
						
						if( isExcluded( type ) ) return;
						
						/**
						 * @setting nothing disabled - Apply this tag to the target object or one of it's parents to prevent a hit from being triggered.
						 * */
						
						if( isSet( element.attr( "disabled" ) ) || element.parents( "[disabled]").length > 0 ) return;

						scope.$evalAsync( function(){
							
							scope.$eval( attrs.pHit, {

								$event: event

							} );
							
						} );
						
					};
					
					// *** Listen ***
					
					var onClick = function( event ){
						
						onHit( "click", event );
						
					};
					
					var onKeyUp = function( event ){
						
						if( event.which === 32 ) onHit( "space", event );
						
						if( event.which === 13 ) onHit( "enter", event );
						
					};
					
					element.bind( "click", onClick );
					element.bind( "keyup", onKeyUp );
					
					// *** Destroy ***
					
					scope.$on( "$destroy", function(){

						element.unbind( "click", onClick );
						element.unbind( "keyup", onKeyUp );
						
					} );
					
				}
				
			};
			
		}
		
	] );
