<?php 
/**
 * JsonSource class.
 *
 * The model object for each request type (create, read, update, delete)
 * must have a member property that defines which api section to refer to.
 * Example: plugin tasks model Task in this app would have a property
 * $apiModel that would be set to Task.
 *
 * Put this in config/database.php
 * var $json_api = array(
 *		'datasource' => 'jsonSource',
 *		'base_url' => 'cake json api url'
 *	);
 * Then in any model that uses the api (or in app model if they all do) add this:
 * public $useDbConfig = 'json_api';
 * 
 *Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @filesource
 * @copyright     Copyright 2010, Loadsys Consulting, Inc. (http://www.loadsys.com)
 * @version       $1.0$
 * @modifiedby    $LastChangedBy: Joey Trapp (Loadsys) $
 * @lastmodified  $Date: 2010-10-14$
 * @license       http://www.opensource.org/licenses/mit-license.php The MIT License
 */
App::import('Core', 'HttpSocket');
 
class JsonSource extends Datasource {

	/**
	 * cacheSources
	 * 
	 * (default value: true)
	 * 
	 * @var bool
	 * @access public
	 */
	public $cacheSources = true;
	
	/**
	 * _baseConfig
	 * 
	 * @var mixed
	 * @access public
	 */
	public $_baseConfig = array(
		'url' => ''
	);
	
	/**
	 * _http
	 * 
	 * (default value: null)
	 * 
	 * @var mixed
	 * @access protected
	 */
	protected $_http = null;
	
	/**
	 * _statusInterpreter
	 * 
	 * (default value: null)
	 * 
	 * @var mixed
	 * @access protected
	 */
	protected $_statusInterpreter = null;
	
	/**
	 * __construct function.
	 * 
	 * @access public
	 * @param mixed $config
	 * @return void
	 */
	public function __construct($config) {
		parent::__construct($config);
		$this->_http =& new HttpSocket();
	}
	
	/**
	 * listSources function.
	 * 
	 * @access public
	 * @param mixed $data. (default: null)
	 * @return void
	 */
	public function listSources($data = null) {
		return true;
	}
	
	/**
	 * describe function.
	 * 
	 * @access public
	 * @param mixed &$Model
	 * @return void
	 */
	public function describe(&$Model) {
		if (property_exists($Model, 'jsonSchema')) {
			$Model->_schema = $Model->jsonSchema;
		} else {
			$Model->_schema = array();
		}
		return $Model->_schema;
	}
	
	/**
	 * read function.
	 * 
	 * @access public
	 * @param mixed &$Model
	 * @param array $query. (default: array())
	 * @return void
	 */
	public function read(&$Model, $query = array()) {
		$url = $this->_setApiUrl($Model);
		return $this->_makeApiCall($url, 'get');
	}
	
	/**
	 * create function.
	 * 
	 * @access public
	 * @param mixed &$Model
	 * @param mixed $fields. (default: null)
	 * @param mixed $values. (default: null)
	 * @return void
	 */
	public function create(&$Model, $fields = null, $values = null) {
		$url = $this->_setApiUrl($Model);
		$data = array_combine($fields, $values);
		return $this->_makeApiCall($url, 'post', $data);
	}
	
	/**
	 * update function.
	 * 
	 * @access public
	 * @param mixed &$Model
	 * @param mixed $fields. (default: null)
	 * @param mixed $values. (default: null)
	 * @return void
	 */
	public function update(&$Model, $fields = null, $values = null) {
		$url = $this->_setApiUrl($Model, $Model->id);
		$data = array_combine($fields, $values);
		return $this->_makeApiCall($url, 'put', $data);
	}
	
	/**
	 * delete function.
	 * 
	 * @access public
	 * @param mixed &$Model
	 * @param mixed $id. (default: null)
	 * @return void
	 */
	public function delete(&$Model, $id = null) {
		$url = $this->_setApiUrl($Model, $id);
		return $this->_makeApiCall($url, 'delete');
	}
	
	/**
	 * calculate function.
	 * 
	 * @access public
	 * @param mixed &$Model
	 * @return void
	 */
	public function calculate(&$Model) {
		return array('count' => true);
	}
	
	/**
	 * Generic method for taking a url, http protocol type, and an
	 * array of data and making the api call.
	 * 
	 * @access protected
	 * @param mixed $url. (default: null)
	 * @param mixed $type. (default: null)
	 * @param mixed $data. (default: null)
	 * @return void
	 */
	protected function _makeApiCall($url = null, $type = null, $data = null) {
		if (!$url || !$type) {
			return false;
		}
		$response = json_decode($this->_http->{$type}($url, $data), true);
		return $response;
	}
	
	/**
	 * Based on the member property $apiModel in the passed in
	 * Model class, returns the url with the appropriate subdirectory
	 * 
	 * @access protected
	 * @param mixed &$Model
	 * @return void
	 */
	protected function _setApiUrl(&$Model, $id = null) {
		$url = $this->config['base_url'];
		if (substr($url, strlen($url) - 1) != '/') {
			$url .= '/';
		}
		if (property_exists($Model, 'apiModel')) {
			$url .= Inflector::pluralize(strtolower($Model->apiModel));
		}
		if (property_exists($Model, 'apiAction')) {
			$url .= '/'.strtolower(Inflector::underscore($Model->apiAction));
			$url = str_replace('.json', '', $url);
			if ($id) {
				$url .= '/'.$id;
			}
		}
		if (substr($url, strlen($url) - 5) != '.json') {
			$url .= '.json';
		}
		return $url;
	}

}

?>