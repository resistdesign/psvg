
/**
 * @name - PSVG
 * */

/**
 * @info - The `PSVG` module declaration. (Includes `ngCompanions`, a collection of directives that integrate **AngularJS** and **PSVG**.)
 * */

/**
 * @tags - Code
 * */

angular.module( "PSVGUtils", [] )
	.factory( "psvgConstants", [
		
		function(){
			
			return {
				
				FLOW_ELEMENT_ATTR: "p-flow-element",
				
				PERCENT_WIDTH_ATTR: "p-percent-width",
				PERCENT_HEIGHT_ATTR: "p-percent-height",
				
				LAYOUT_ATTRS: [

					"x",
					"y",
					"r",
					"b",
					"width",
					"height"

				],
				
				LAYOUT_ATTRS_MAP: {
					
					"x": true,
					"y": true,
					"r": true,
					"b": true,
					"width": true,
					"height": true
					
				},

				LAYOUT_BOX_ATTR_SELECTOR: "[p-layout-box]"
				
			};
			
		}
		
	] )
	.factory( "psvgEventTypes", [
		
		function(){
			
			/**
			 * @api-value object psvgEventTypes - A factory object containing event type constants for the layout system as follows:
			 * <pre>
			 * 	- `LAYOUT_CHANGED` - The event dispatched whenever the size and/or position of a layout element changes.
			 * </pre>
			 * */
			
			return {
				
				LAYOUT_CHANGED: "LAYOUT_CHANGED"
				
			}
			
		}
		
	] )
	.factory( "isArray",
		
		function(){
			
			/**
			 * @api-function true/false isArray - Check to see if an object is an array.
			 * 
			 * @arg MISC object - The object to check.
			 * */
			
			var isArray = function( object ){
	
				if( Object.prototype.toString.call( object ) === "[object Array]" ){
	
					return true;
	
				}
	
				return false;
	
			};
	
			return isArray;
	
		}
	
	)
	.factory( "isSet", [

		"isArray",
		function( isArray ){
			
			/**
			 * @api-function true/false isSet - Check to see is the value of an attribute is set.
			 * 
			 * @arg MIXED value - Any value or list of values.
			 * @arg true/false any - A value designating that `value` is considered to be set if **any** items in the list are set. Default: `false`
			 * */
			
			var isSet = function( value, any ){

				if( isArray( value ) ){

					// TRICKY: The value of `any` must be explicit.
					if( !any ) any = false;
					if( any !== false ) any = true;

					var valIsSet = !any;

					for( var k in value ){

						if( isSet( value[ k ], any ) == any ){

							valIsSet = !valIsSet;

							break;

						}

					}

					return valIsSet;

				}

				var valType = typeof value;

				if( "undefined" === valType || "false" === valType ){

					return false;

				}

				return true;

			};

			return isSet;

		}

	] )
	.factory( "watchAttrSet", [
		
		function(){
			
			/**
			 * @api-function nothing watchAttrSet - Watch all attributes in the given set.
			 * 
			 * @arg Scope scope - The scope to listen to for the "$destroy" event for the purpose of tearing down all watchers.
			 * @arg attributesObject attrs - The AngularJS attributes object from a directive's link function.
			 * @arg list attrSet - The list of attributes to watch.
			 * @arg function callback - The function to be called when an attribute changes. This function will receive the **attribute name** and **new value**.
			 * */
			
			var watchAttrSet = function( scope, attrs, attrSet, callback ){
				
				// *** Watch All Attributes In The Given Set ***
				
				var unwatchFunctions = [];
				
				for( var i = 0; i < attrSet.length; i++ ){
					
					var currAttr = attrSet[ i ];
					
					var unwatchAttr = attrs.$observe( currAttr, function( newValue ){
						
						if( "function" === typeof callback ) callback( currAttr, newValue );
						
					} );

					unwatchFunctions.push( unwatchAttr );
					
				}
				
				// *** Destroy ***
				
				scope.$on( "$destroy", function(){

					for( var i = 0; i < unwatchFunctions.length; i++ ){

						var funcRef = unwatchFunctions[ i ];

						if( "function" === typeof  funcRef ) funcRef();

					}

				} );
				
			};
			
			return watchAttrSet;
			
		}
		
	] )
	.factory( "watchScopeValueSet", [
		
		function(){
			
			/**
			 * @api-function nothing watchScopeValueSet - Watch all scope values in the given set.
			 * 
			 * @arg Scope scope - The scope to watch for values changes and to listen to for the "$destroy" event for the purpose of tearing down all watchers.
			 * @arg list valueSet - The list of values to watch.
			 * @arg function callback - The function to be called when a value changes. This function will receive the **value name**, **new value** and **old value**.
			 * @arg attributesObject attrs - (Optional) The AngularJS attributes object from a directive's link function. **If supplied**, the values of attributes will be watched instead of the names of the values in the `valueSet`.
			 * */
			
			var watchScopeValueSet = function( scope, valueSet, callback, attrs ){
				
				// *** Watch All Attributes In The Given Set ***
				
				var unwatchFunctions = [];
				
				for( var i = 0; i < valueSet.length; i++ ){
					
					var currValue = valueSet[ i ];
					
					var watchValue = attrs ? attrs[ currValue ] : currValue;
					
					var unwatchValue = scope.$watch( watchValue, function( newValue, oldValue ){
						
						if( "function" === typeof callback ) callback( currValue, newValue, oldValue );
						
					} );

					unwatchFunctions.push( unwatchValue );
					
				}
				
				// *** Destroy ***
				
				scope.$on( "$destroy", function(){

					for( var i = 0; i < unwatchFunctions.length; i++ ){

						var funcRef = unwatchFunctions[ i ];

						if( "function" === typeof  funcRef ) funcRef();

					}

				} );
				
			};
			
			return watchScopeValueSet;
			
		}
		
	] )
	.factory( "lastAttrValue", [
		
		function(){
			
			/**
			 * @api-function true/false lastAttrValue - Check to see if the given attribute of an element has changed **while also** assigning the supplied value as the last set value.
			 * 
			 * @arg elementReference element - The element reference containing the attribute to check.
			 * @arg text attr - The attribute to check and assign the last value for.
			 * @arg text/number newValue - The new value to check against and assign.
			 * @arg true/false assign - A value designating whether or not to assign the newValue as the last value. Default: `true`
			 * */
			
			var lastSetPrefix = "p-last-set-";
			
			var lastAttrValue = function( element, attr, newValue, assign ){
				
				var lastSetAttrName = lastSetPrefix + attr;
				
				var changed = String( newValue ) !== String( element.attr( lastSetAttrName ) );
				
				assign = "undefined" === typeof assign ? true : assign;
				
				if( assign ){
					
					element.attr( lastSetAttrName, newValue );
					
				}
				
				return changed;
				
			};
			
			return lastAttrValue;
			
		}
		
	] )
	.factory( "isPercentage", [
		
		function(){

			var isPercentage = function( value ){

				return ( "string" === typeof value && value.indexOf( "%" ) !== -1 );

			};
			
			return isPercentage;
			
		}
		
	] )
	.factory( "parseLayoutAttr", [
		
		"isPercentage", "psvgConstants", "isSet",
		function( isPercentage, psvgConstants, isSet ){

			var verticalMap = {

				"x": 0,
				"y": 1,
				"r": 0,
				"b": 1,
				"width": 0,
				"height": 1

			};
			
			var parseLayoutAttr = function( scope, element, attr ){

				// TRICKY: Avoid setting **size** if it is implied by **both position attributes**.
				if( attr == "width" ){

					var pX = element.attr( "x" );
					var pR = element.attr( "r" );

					if( pX === "" ) pX = undefined;
					if( pR === "" ) pR = undefined;

					if( isSet( [ pX, pR ] ) ) return "";

				}

				if( attr == "height" ){

					var pY = element.attr( "y" );
					var pB = element.attr( "b" );

					if( pY === "" ) pY = undefined;
					if( pB === "" ) pB = undefined;

					if( isSet( [ pY, pB ] ) ) return "";

				}

				var attrVal = element.attr( attr );

				// Return if attr is just a number.
				if( !isNaN( attrVal ) ) return attrVal;

				var parent = element.parents( psvgConstants.LAYOUT_BOX_ATTR_SELECTOR );
				var topLevel = parent.length == 0;
				if( topLevel ) parent = angular.element( "body" );

				var parentLayoutScope = scope.$new();

				parentLayoutScope.parentWidth = parent[ 0 ].clientWidth;
				parentLayoutScope.parentHeight = parent[ 0 ].clientHeight;

				parentLayoutScope.thisWidth = element.outerWidth();
				parentLayoutScope.thisHeight = element.outerHeight();

				var isVertical = verticalMap[ attr ];
				
				if( isPercentage( attrVal ) ){

					var calcValue = isVertical ? parentLayoutScope.parentHeight : parentLayoutScope.parentWidth;

					var percentNumber = attrVal.split( "%" ).shift();

					attrVal = ( calcValue / 100 ) * parseFloat( percentNumber );

				}else{
					
					var parentDim = isVertical ? parentLayoutScope.parentHeight : parentLayoutScope.parentWidth;
					var eleDim = isVertical ? parentLayoutScope.thisHeight : parentLayoutScope.thisWidth;
					
					var centerVal = parentDim / 2;
					var eleCenterVal = eleDim / 2;
					var offsetCenterVal = centerVal - eleCenterVal;
					
					// TRICKY: Ensure that `parentCenter` is not a negative value.
					parentLayoutScope.parentCenter = centerVal < 0 ? 0 : centerVal;

					// TRICKY: Ensure that `thisCenter` is not a negative value.
					parentLayoutScope.thisCenter = eleCenterVal < 0 ? 0 : eleCenterVal;

					// TRICKY: Ensure that `center` is not a negative value.
					parentLayoutScope.center = offsetCenterVal < 0 ? 0 : offsetCenterVal;
					
					attrVal = parentLayoutScope.$eval( attrVal );

				}

				parentLayoutScope.$destroy();

				return attrVal;

			};
			
			return parseLayoutAttr;
			
		}
		
	] );

// IMPORTANT: `ngCompanions` are required to integrate AngularJS with the PSVG layout system.

angular.module( "ngCompanions", [ "PSVGUtils" ] )
	.factory( "ngIntegration", [

		"watchScopeValueSet", "psvgEventTypes",
		function( watchScopeValueSet, psvgEventTypes ){
			
			var ngIntegration = function( scope, element, valueSet, attrs ){

				var thisDispatcher = {};

				watchScopeValueSet( scope, valueSet, function( valueName, newValue, oldValue ){
					
					element.trigger( psvgEventTypes.LAYOUT_CHANGED, thisDispatcher );

				}, attrs );

			};
			
			return ngIntegration;
			
		}
		
	] )
	.directive( "ngShow", [

		"ngIntegration",
		function( ngIntegration ){
			
			return {
				
				restrict: "A",
				link: function( scope, element, attrs ){

					ngIntegration( scope, element, [ "ngShow" ], attrs );
					
				}
				
			};
			
		}
		
	] )
	.directive( "ngHide", [

		"ngIntegration",
		function( ngIntegration ){
			
			return {
				
				restrict: "A",
				link: function( scope, element, attrs ){

					ngIntegration( scope, element, [ "ngHide" ], attrs );
					
				}
				
			};
			
		}
		
	] )
	.directive( "ngBind", [

		"ngIntegration",
		function( ngIntegration ){
			
			return {
				
				restrict: "A",
				link: function( scope, element, attrs ){

					ngIntegration( scope, element, [ "ngBind" ], attrs );
					
				}
				
			};
			
		}
		
	] )
	.directive( "ngRepeat", [

		"ngIntegration",
		function( ngIntegration ){
			
			var getScopeSpecificValues = function( scope ){
				
				var attrList = [];
				
				for( var k in scope ){
					
					if( k !== "this" && k !== "constructor" && k.indexOf( "$" ) !== 0 ){
						
						attrList.push( k );
						
					}
					
				}
				
				return attrList;
				
			};
			
			return {
				
				restrict: "A",
				link: function( scope, element, attrs ){

					ngIntegration( scope, element, getScopeSpecificValues( scope ) );
					
				}
				
			};
			
		}
		
	] );

angular.module( "PSVG", [ "ngCompanions" ] );
