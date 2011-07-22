<?php
/**
 * Json Api Behavior
 * 
 * Behavior that sets defaults to models that before specific actions
 *
 * @package default
 * @author Joey Trapp <joey@loadsys.com>
 * @copyright Loadsys
 **/
class JsonApiBehavior extends ModelBehavior {

/**
 * Before find callback
 *
 * @param object $model Model using this behavior
 * @param array $queryData Data used to execute this query, i.e. conditions, order, etc.
 * @return boolean True if the operation should continue, false if it should abort
 * @access public
 */
	public function beforeFind(&$model, $query) {
		$this->setApiSettings($model, 'index');
		return true;
	}


/**
 * Before save callback
 *
 * @param object $model Model using this behavior
 * @return boolean True if the operation should continue, false if it should abort
 * @access public
 */
	public function beforeSave(&$model) {
		$action = 'add';
		if (isset($model->id) && !empty($model->id)) {
			$action = 'edit';
		}
		$this->setApiSettings($model, $action);
		return true;
	}

/**
 * Before delete callback
 *
 * @param object $model Model using this behavior
 * @param boolean $cascade If true records that depend on this record will also be deleted
 * @return boolean True if the operation should continue, false if it should abort
 * @access public
 */
	public function beforeDelete(&$model, $cascade = true) { 
		$this->setApiSettings($model, 'delete');
		return true;
	}

/**
 * DataSource error callback
 *
 * @param object $model Model using this behavior
 * @param string $error Error generated in DataSource
 * @access public
 */
	public function onError(&$model, $error) { 
	
	}
	
/**
 * Method that checks a model for properties used in the json_api datasource, and sets them
 * to defaults of they are not already set explicitly.
 *
 * @author Joey Trapp <joey@loadsys.com>
 * @access protected
 * @param object $model
 * @param mixed $id
 * @return void
 */
	protected function setApiSettings(&$model, $action) {
		if (!property_exists($model, 'apiModel') || empty($model->apiModel)) {
			$model->apiModel = $model->name;
		}
		if (!property_exists($model, 'apiAction') || empty($model->apiAction)) {
			$model->apiAction = 'index';
		}
	}

}

?>