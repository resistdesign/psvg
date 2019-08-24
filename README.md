![Parasol SVG](https://bytebucket.org/rgraff/parasol-svg/raw/84b16eb2a2a2b372924b589bca532bec196dfcd4/logo.svg?token=14d2a7d02d784f69365b95552832ae082f16765b "Parasol SVG")

> Tools and Compilers for quickly building production ready applications using [AngularJS](http://angularjs.org) directives with view and component layouts converted from [SVG](http://www.w3.org/TR/SVG11/) to HTML.

## Basic Info

#### Installation (OS X)

1. Install **homebrew** `ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go/install)"`
2. Install **node.js** `brew install node`
3. Install **ParasolSVG** `npm install -g git+ssh://git@github.com:connectstudios/parasol-svg.git`

#### Project Setup

1. Navigate to your project in terminal, example: If your project folder is at "UserName -> Documents -> workspace -> ParasolSVGProject" then enter: `cd ~/Documents/workspace/ParasolSVGProject`
2. Setup your project (if necessary): `psvg --setup`
3. Start the live compiler: `psvg --run`
4. To view a live preview while you edit open your browser to the following address: `http://127.0.0.1:8080`
5. To preview from a device or another computer go to: `http://{YOUR_IP_ADDRESS}:8080` where `{YOUR_IP_ADDRESS}` is the ip address of the computer running `psvg --run`. (See your network administrator for help.)
6. To change the live preview server port use the `--port` switch, for example: `psvg --run --port=9000`
7. To prevent your browser from automatically refreshing a live preview (when changes are made) add `noReload=true` to the address, for example: `http://127.0.0.1:8080?noReload=true`

#### Production Deployment

1. Deploy a project production build with `psvg --deploy`.
2. To deploy to a specified directory, other than that configured as the project `public` directory, use the `--target` switch, for example: `psvg --deploy --target=../production/public`
3. The `target` switch can be set to an absolute path or one relative to the current project directory.
4. Exclude files and folders from a production deployment by adding the `excludeFromProduction` property to the `PSVGConfig.json` file.
	- Example: `"excludeFromProduction": [ "debug", "*.info.txt", "info/dev-notes.txt" ]`
	- Paths are relative to the project `src` folder.
	- `*` denotes a wildcard file extension, meaning all files with this **full** file extension will be excluded from deployment.

#### API Relay Setup

1. API Relay allows the application to make calls to a separate host, based on an API endpoint prefix, while avoiding the "same origin" policy problem.
2. Start the live compiler with the **relay** option: `psvg --run --relay=127.0.0.1:9000/api`
	- Relay option parts: `host:port/prefix`
		- **host**: (Required) The host server providing the API.
		- **port**: The port to connect to on the API host server. (Default: `80`)
		- **prefix**: The prefix for all URL endpoints that will be relayed to the API host server. (Default: `/api`)
3. Throttle the API response for "load time testing": `--throttle=1000`
	- The `--throttle` option is set in milliseconds. (Default: 0)
4. The `--mock` flag allows for setting **mock data** for various RESTful API endpoints.
	- Set the `--mock` flag to the path of a Node.js module relative to the project folder, for example: `--mock=MockData.js`
	- A mock data module must be structured as follows:
		- The top level properties represent the **RESTful methods**, for example:
			<pre>
			module.exports = {
						
						get: {}
						post: {}
						
					};
			</pre>
	- The value for each RESTful method property is a hierarchical object structure with the following types of properties:
		- Optional default headers (Via the `$headers` property.), for example:
			<pre>
			module.exports = {
						
						get: {
							
							$headers: {
								
								"Content-Type": "application/json"
								
							}
							
						}
						post: {}
						
					};
			</pre>
		- Endpoint paths, for example:
			<pre>
			module.exports = {
						
						get: {
							
							api: {
								
								internal: {
									
									settings: {}
									
								}
								
							}
							
						}
						post: {}
						
					};
			</pre>
		- Endpoint specific body and headers (Via the `$body` and `$headers` properties.), for example:
			<pre>
			module.exports = {
						
						get: {
							
							api: {
								
								internal: {
									
									settings: {
										
										$headers: {
											
											"Content-Type": "application/json"
											
										},
										$body: [
											
											{
												
												name: "Theme",
												value: "Blue"
												
											},
											{
												
												name: "Panels",
												value: [ 11, 6, 28, 9, 221, 40 ]
												
											}
											
										]
										
									}
									
								}
								
							}
							
						}
						post: {}
						
					};
			</pre>
		- If the `$body` or `$headers` properties are functions, they will be called with the following arguments:
			- `request` - The request object.
			- `path` - The full path to the requested API endpoint.
			- `query`- An object representing the query portion of the request URI.
		

## Designer Info

#### Editing SVG Files

1. Save SVG files (**That will be converted into HTML**) to the `src` folder in your project as `app.svg` (Apps) or `comp.svg` (Components/Views) files accordingly.
2. In Adobe Illustrator you may apply "tags" to add functionality to your design.
3. "Tags" are added in the label for a layer, object, group, etc.
4. In the label, simply add an @ symbol after the layer name and then some tags, example:
	`My Box@bounce width="50%" height="someValue"`
5. See your project documentation for available tags and details.
6. HTML attributes are supported as well.
7. IMPORTANT: When saving an SVG file from Illustrator ensure that **CSS Properties** are saved as **Presentation Attributes** in the **SVG Options** window.
8. **EXTENDED TAGS:** Illustrator only supports up to 255 letters and numbers in object labels, if you need more space you can use an **attributes file**:
	- Make a file in the same folder as your `app.svg` or `comp.svg` file with the same name BUT with an extension of `attr.js`, for example,
	an attributes file for the file `src/comps/item.comp.svg` would be `src/comps/item.attr.js`.
	- The **attributes file** is a node.js module in the form of an object with SVG object IDs as property names.
	- The SVG object ID is everything before the `@` symbol and with all spaces replaced by `_`,
	for example, an SVG object with the label `My BG Box@tag` would have an ID of `My_BG_Box`.
		- HINT: SVG object IDs should be **unique** so that an object does not have the tags intended for another object applied to it.
	- The values of the properties on the attributes file module are objects with tag names as properties.
	- Here is an example attributes file:
		<pre>
		module.exports = {
			
			"my-svg-object-id": {
				
				"title": "Amazing Object!",
				"p-layout-direction": "col"
				
			},
			"Some_Other_Object_ID": {
				
				"p-x": "center",
				"p-b": "10"
				
			}
			
		};
		</pre>

## Developer Info

#### SVG Apps

1. Save an SVG file with the extension `app.svg` to create an SVG App with all necessary files included. Files with the extension `app.svg` will be deployed with an `html` extension.
2. Add a **main application** JavaScript file by creating an `app.js` file in `src/assets/js`.
	- This file is where you would include your AngularJS **controller** for your app.
	- You would apply your main app controller to your app by using the `ng-controller` directive on the outer-most group in your SVG file via the object label in Illustrator as explained in the **Editing SVG Files** section.
	- When naming your main **main application** JavaScript file, if your SVG App is named `index.app.svg` then you would create a file called `index.app.js`. NOTE: This feature is only supported for SVG Apps located in the root of the project source folder.
3. You **MUST** declare your app module with the `PSVG` module (`angular.module( "App", [ "PSVG" ] );`) in order to use the built-in directives.
4. HINT: The top level "Layer" object in Adobe Illustrator is usually the best place to declare the `ng-app` and `ng-controller` attributes for your main application.
5. **METADATA:** App metadata files allow you to specify information about each app.
	- Make a file in the same folder as your `app.svg` file with the same name BUT with an extension of `meta.js`, for example,
	a metadata file for the file `src/index.app.svg` would be `src/index.meta.js`.
	- You may set the following properties in the metadata file:
		- `title` - The title of the application.
		- `head` - Some html to insert into the HEAD area of the compiled app.
	- Here is an example metadata file:
		<pre>
		module.exports = {
        	
        	title: "pinium",
        	head: '&lt;meta name="viewport" content="width=device-width, user-scalable=no"&gt;'
        	
        };
		</pre>

#### SVG Components

1. Save an SVG file with the extension `comp.svg` to create an SVG component. Files with the extension `comp.svg` will be deployed with an `html` extension.

#### SVG Compiler Directives

1. SVG compiler directives (`compdir.js` files) are run at compile time and transform SVG nodes.
2. Compiler directives must be stored in the project source folder. (`src` by default.)
3. A compiler directive is only run on an SVG node with a matching attribute ("tag"), for example, an SVG node with the attribute `p-remove-filters` would be passed through the following directive: `{PROJECT}/src/p/remove/filters.compdir.js` (Directories are included for organization.)
4. Compiler directives are node.js modules containing functions with the following signature:
	<pre>
	exports.directive = function( node, parentList ){};
	</pre>
5. The arguments to this function are as follows:
	- `node` - The HTML node object with the following properties:
		- `name` - The node name, such as `rect`.
		- `attr` - An object with properties representing the node's attributes.
		- `children` - And array of child node objects.
		- `val` - The text value, if there are no children, of the node.
		- `recompile` - A flag telling the compiler to recompile the node. **WARNING:** Your compiler directive is responsible for **AVOIDING INFINITE COMPILING**, usually a custom flag set on the node will work.
	- `parentList` - An array of parent SVG node objects with the direct parent of `node` as the last index.
6. A directive should directly manipulate the node object and/or it's parents as the return value is ignored.
7. Compiler directives are run **after** SVG is converted into HTML.

#### AngularJS Directives

1. AngularJS directive names must include their directory (relative to the project source folder), for example, the directive name for the file `{PROJECT}/src/p/filter.js` would be `pFilter`.

#### Documentation Generation

1. Project documentation can be auto-generated with: `psvg --doc`
	- NOTE: Documentation for "built-in" directives/tags is automatically included in project specific documentation when generated.
2. The default documented file types are: `compdir.js`, `app.js` and `js`
3. `compdir.js` and `js` file documents are merged when their base names and directories match, for example, the files `fancy.compdir.js` and `fancy.js` will share the document `fancy.md`.
4. The following comment formats are included in project documentation:
	- Name (The name of the factory, provider, etc. Replaces the attribute format of the name.)
	
	```
	/**
	  * @name - fileName
	  */
	```
	- Info (Info about the file.)
	
	```
	/**
	  * @info - Some information about the file.
	  */
	```
	
	- Tags (A list of tags to be shown in the table of contents.)
	
	```
	/**
	  * @tags - Important, Layout
	  */
	```
	
	- Setting (A property on an AngularJS directive **scope**.)
	
	```
	/**
	  * @setting type settingName - Description.
	  */
	```
	
	- Externally Accessible Value (A property on the controller or factory that can be accessed.)
	
	```
	/**
	  * @api-value type valueName - Description.
	  */
	```
	
	- Externally Accessible Function (A function the controller or factory that can be called.)
	
	```
	/**
	  * @api-function returnType functionName - Description.
	  *
	  * @arg type argumentName - Argument description.
	  */
	```
	
	- Internally Accessible Value (A property on the directive **scope** that can be bound to.)
	
	```
	/**
	  * @value type valueName - Description.
	  */
	```
	
	- Internally Accessible Function (A function the directive **scope** that can be called.)
	
	```
	/**
	  * @function returnType functionName - Description.
	  *
	  * @arg type argumentName - Argument description.
	  */
	```
	
**NOTE: Remember to generate project documentation when committing code changes.**
