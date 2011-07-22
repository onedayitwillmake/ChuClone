<?php
/**
 * Request Data Component
 *
 * Component that merges like data into a common location. Will merge query string 
 * and named parameters together into a single location. Also will merge together
 * form and data values and set them to the controllers data property
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @filesource
 * @copyright     Copyright 2010, Loadsys Consulting, Inc. (http://www.loadsys.com)
 * @version       $1.0$
 * @modifiedby    $LastChangedBy: Joey Trapp (Loadsys) $
 * @lastmodified  $Date: 2010-10-14$
 * @license       http://www.opensource.org/licenses/mit-license.php The MIT License
 */
class RequestDataComponent extends Object {

	/**
	 * The default key that the data is placed in. Can be found in
	 * $controller->params[$key].
	 * 
	 * @var string
	 * @access public
	 */
	public $key = 'requestData';
	
	/**
	 * Whether or not to add the named parameters to the request
	 * data arrray
	 * 
	 * @var bool
	 * @access public
	 */
	public $named = true;
	
	/**
	 * Whether or not to add the query string data to the request 
	 * data array
	 * 
	 * @var bool
	 * @access public
	 */
	public $query = true;

	/**
	 * Array of valid options that can be modified from the settings
	 * array passed into the component's initialize method. Should
	 * refect member properties that can be configurable.
	 * 
	 * @var array
	 * @access public
	 */
	public $validOptions = array(
		'key',
		'named',
		'query'
	);
	
	public $data = array();

	/**
	 * initialize function.
	 * 
	 * @access public
	 * @param mixed &$controller
	 * @param array $settings. (default: array())
	 * @return void
	 */
	public function initialize(&$controller, $settings = array()) {
		$this->setOptions($settings);
		$this->parseData($controller->params);
		$controller->params[$this->key] = $this->data;
		$controller->params['named'] = $this->data;
		$controller->data = $this->formData;
	}
	
	/**
	 * Takes the settings array passed into the initialize method and
	 * sets member properties to appropriate values.
	 * 
	 * @access protected
	 * @param array $options
	 * @return bool
	 */
	protected function setOptions($options) {
		if (!is_array($options) || empty($options)) {
			return false;
		}
		foreach ($this->validOptions as $type) {
			if (array_key_exists($type, $options)) {
				$this->{$type} = $options[$type];
			}
		}
		return true;
	}
	
	/**
	 * Takes params from the controller and merges the query string
	 * data and named parameter data. Then it merges params['form']
	 * and params['data'] and assigns it to $this->formData
	 * 
	 * @access protected
	 * @param array $data
	 * @return void
	 */
	protected function parseData($params) {
		if (!is_array($params) || empty($params)) {
			return array();
		}
		$formData = array();
		$queryData = array();
		$namedData = array();
		if ($this->query) {
			if (!empty($params['url'])) {
				unset($params['url']['url']);
				unset($params['url']['ext']);
				if (!empty($params['url'])) {
					$queryData = $params['url'];
				}
			}
		}
		if ($this->named) {
			if (!empty($params['named'])) {
				$namedData = $params['named'];
			}
		}
		$form = array();
		$data = array();
		if (!empty($params['form'])) {
			$form = $params['form'];
		}
		if (!empty($params['data'])) {
			$data = $params['data'];
		}
		$this->formData = array_merge($form, $data);
		$this->data = array_merge($namedData, $queryData);
		return;
	}

}

?>