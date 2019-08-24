
/**
 * @info - Test src file.
 * This is a test src file.
 * */

/**
 * @tags - Important
 * */

var testFunc = function(){
	
	var message = "This is a test file.";
	
	console.log( message );
	
	return {
		
		restrict: "A",
		scope: {
			
			/**
			 * @setting text setting-one - This is a test setting. Usage: `setting-one="someValue"`
			 * */
			settingOne: "@",
			/**
			 * @value number valueOne - This is a test value.
			 * */
			valueOne: "=?"
			
		},
		link: function( scope, element, attrs ){
			
			/**
			 * @function nothing testFuncOne - This is a test function.
			 * */
			scope.testFuncOne = function(){
				
				console.log( "Test Function One." );
				
			};
			
			/**
			 * @function nothing testFuncTwo - This is another test function.
			 * 
			 * @arg number valueOne - The first value.
			 * @arg number valueTwo - The second value.
			 * */
			scope.testFuncTwo = function( valueOne, valueTwo ){
				
				console.log( valueOne + valueTwo );
				
			};
			
		}
		
	};
	
};

testFunc();
