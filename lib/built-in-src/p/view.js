
/**
 * @setting text p-view - The name of the **context** of this view placeholder object.
 * <br>
 * Usage: `p-view="main"`, `p-view`
 * */

/**
 * @setting text p-load-view - The directive to load as a view.
 * <br>
 * Usage: `p-load-view="views-tools-calc"`, `p-load-view="{{currentView}}"`
 * */

angular.module( "PSVG" )
	.directive( "pView", [

		"$compile", "$rootScope", "$route", "psvgEventTypes", "isSet", "psvgConstants", "$routeParams",
		function( $compile, $rootScope, $route, psvgEventTypes, isSet, psvgConstants, $routeParams ){

			return {

				restrict: "A",
				compile: function( tElement, tAttrs, transclude ){
					
					// *** View Element Template ***

					var DIV_HTML = '<div></div>';
					
					var children = tElement.children();
					
					if( children.length > 0 ){
						
						/**
						 * @info - IMPORTANT: If the `p-view` is a group containing an object, that object will be used as a template to initialize the tags for all loaded views. NOTE: Layout and style related tags `(x,y,r,b,width,height,style)` are ignored by default. (See: `p-init-layout-tags`)
						 * */
						
						var attrChild = children.first();
						
						var initAttrs = attrChild[ 0 ].attributes;
						
						attrChild.remove();
						
						var initAttrString = "";
						
						/**
						 * @setting text p-init-layout-tags - A comma separated list of layout tags to allow as initial loaded view tags.
						 * <br>
						 * Usage: `p-init-layout-tags="x,style,b"`
						 * */
						
						var includedLayoutAttrs = tAttrs.pInitLayoutTags;
						
						var includedTags = {};
						
						if( isSet( includedLayoutAttrs ) ){
							
							var lAttrList = includedLayoutAttrs.split( ", " ).join( "," ).split( "," );
							
							for( var i = 0; i < lAttrList.length; i++ ){
								
								var incAttr = lAttrList[ i ];
								
								includedTags[ incAttr ] = true;
								
							}
							
						}
						
						angular.element.each( initAttrs, function(){
							
							if( this.specified && ( includedTags[ this.name ] || ( !psvgConstants.LAYOUT_ATTRS_MAP[ this.name ] && this.name !== "style" ) ) ){
								
								initAttrString += ' ' + this.name + '="' + this.value + '"';
								
							}
							
						} );
						
						DIV_HTML = '<div' + initAttrString + '></div>';
						
					}
					
					// *** Link Function ***
					
					return function( scope, element, attrs ){

						// *** Manage Views ***

						var thisDispatcher = {};

						var removeView = function(){

							element.children().remove();

							// IMPORTANT: Notify the layout system about the removed view.
							element.trigger( psvgEventTypes.LAYOUT_CHANGED, thisDispatcher );

						};

						var loadedDirective;

						var loadDirectiveView = function( directive, refresh ){

							/**
							 * @setting true/false p-refresh - Set to `true` to always reload this context when the route changes.
							 * */

							refresh = attrs.pRefresh === "true" ? true : refresh;

							if( !refresh && directive === loadedDirective ) return;

							loadedDirective = directive;

							removeView();

							var newElement = angular.element( DIV_HTML );
							newElement.attr( directive, "" );

							/**
							 * @setting nothing p-fit - Apply this tag to constrain the width and height of the target view to that of this view placeholder object.
							 * <br>
							 * Usage: `p-fit`
							 * */

							var fit = attrs.pFit;

							if( isSet( fit ) ){

								newElement.attr( "x", "0" );
								newElement.attr( "y", "0" );
								newElement.attr( "r", "0" );
								newElement.attr( "b", "0" );

							}

							/**
							 * @setting nothing p-min-fit - Apply this tag to constrain the minimum width and minimum height of the target view to that of this view placeholder object.
							 * <br>
							 * Usage: `p-min-fit`
							 * */

							var minFit = attrs.pMinFit;

							if( isSet( minFit ) ){

								newElement.css( "min-width", "100%" );
								newElement.css( "min-height", "100%" );

							}

							element.append( $compile( newElement )( scope ) );

							// IMPORTANT: Notify the layout system about the added view.
							element.trigger( psvgEventTypes.LAYOUT_CHANGED, thisDispatcher );

						};

						// *** Watch ***

						var onRouteChange = function(){

							var context = attrs.pView;
							var loadView = attrs.pLoadView;

							if( loadView ) return;

							if( !context ){

								removeView();

								return;

							}

							var route = $route.current;

							if( !route || !route.directives || ( "undefined" === typeof route.directives[ context ] && "undefined" === typeof $routeParams[ context ] ) ){

								removeView();

								return;

							}

							var currentDirective = "undefined" === typeof route.directives[ context ] ? $routeParams[ context ] : route.directives[ context ];
							var refresh = route.refresh && route.refresh[ context ];

							loadDirectiveView( currentDirective, refresh );

						};

						var unwatchRoute = $rootScope.$on( "$routeChangeSuccess", onRouteChange );

						var onLoadViewChange = function(){

							var context = attrs.pView;
							var loadView = attrs.pLoadView;

							if( !loadView ){

								if( !context ) removeView();

								return;

							}

							loadDirectiveView( loadView );

						};

						var unwatchPLoadView = attrs.$observe( "pLoadView", onLoadViewChange );

						// *** Destroy ***

						scope.$on( "$destroy", function(){

							if( "function" == typeof unwatchRoute ) unwatchRoute();
							if( "function" == typeof unwatchPLoadView ) unwatchPLoadView();

						} );

						// *** Initialize ***

						onRouteChange();

					};
					
				}

			};

		}

	] );
