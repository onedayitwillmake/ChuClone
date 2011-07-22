## Description

This plugin contains multiple smaller pieces that come together to make creating a JSON api easier.

### Get the plugin

	cd app/plugins
	git clone git@github.com:loadsys/JSON-API.git json_api
	
### Prerequisites

Components in this plugin use the JSON php extension (json_encode() and json_decode()).
The following code needs to be placed in the app/config/routes.php:

	Router::parseExtensions('json')

## Request Data Component

The request data component is a simple component that merges data into two common locations on each request. Any data that is stored in $controller->params['named'] and $controller->params['url'] (after params['url']['url'] and params['url']['ext'] have been unset) will be merged together and set in $controller->params['requestData']. Any data that is in $controller->params['form'] and $controller->params['data'] will be merged and added to $controller->data. The purpose for this is that you can make the standard for sending data to the api however you wish, and there will always be a common place to find the data.

### Usage

If the entire app is going to be the api, you can include this in the app_controller.php, and if not include it in the plugin_app_controller.php or something_controller.php as necessary
	
	public $components = array(
		'json_api.RequestData' => array(
			'key' => 'myData' // Named and query string parameters are stored in the $controller->params[$key]. $key defaults to 'requestData'
			'named' => true,  // Whether or not to merge named parameters in
			'query' => true   // Whether or not to merge query string parameters in
		)
	);
	
In your controller, you have access to the data in multiple ways:

#### Form Data
	$controller->data;
	$controller->RequestData->formData;

#### Query and Named Params
	$controller->params[$key]
	$controller->RequestData->data;

## Server Response Component

The server response component follows the REST convention of server status codes and sets them automatically based on the method type being accessed and whether or not the method was successful. The component will also check for paging data and add response headers for pagination data. This component currently only works with JSON requests, and defaults to returning a json_encode() string.

### Usage

#### Including component

If the entire app is going to be the api, you an include this in the app_controller.php. If not, include it in the plugin_app_controller.php or something_controller.php as necessary.

	public $components = array('json_api.ServerResponse');
	
#### Setting the method type

The component will check the requested action and if it one of the default CRUD actions (index, view, add, edit, delete) nothing needs to be done. On the other hand, if you have an action called 'search', you would have to tell the component what type of action this is. In the case of 'search', it would most likely be a 'view' type action. The method type is used automatically determine the response code based the methods success.

If you have to set the methodType, do so in the $controller->beforeFilter() method. There is code in the components startup() method that checks if the method type matches the http protocol type (GET or POST), and sets status code and renders the page early on failure (i.e. an 'edit' method type that uses the GET protocol).

To set the method type, use the following method in the controller:

	$this->ServerResponse->setMethodType('methodType');
	
Valid method types are 'add', 'edit', 'delete' and 'view'. Setting the method type to anything other than that will result in a '501 Method Not Implemented' response code.
	
#### Telling component that the controller method failed

A method is successful by default, so it is only on error that you have to explicitly tell the component that something failed. To do so, you would call a method from the controller:

	$this->ServerResponse->setMethodSuccess(false);
	
#### Setting data for output
	
When serving json, this component cuts out the view layer entirely. At the end of the ServerResponse->beforeRender() method, the components echo's json_encode($data) and exit()'s. To set data to be sent in the output, call the set method on the component. Data can be set in the following ways:

	$this->ServerResponse->set('key', 'value');
	$this->ServerResponse->set('key', $arrayOfData);
	$this->ServerResponse->set(array('key' => $data, 'another_key' => $moreData));
	
Each time the ServerResponse->set() method is called, the new data is merged with the previous data, where the new data will replace old data if keys are the same.

## JSON Datasource

## Test App (Pulling it together)