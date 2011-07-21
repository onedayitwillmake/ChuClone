<?php
/**
 * Created by IntelliJ IDEA.
 * User: onedayitwillmake
 * Date: 7/21/11
 * Time: 12:13 AM
 * To change this template use File | Settings | File Templates.
 */
 
class LevelsController extends AppController {
	var $helpers = array("Html", "Form");
	var $name = "Levels";
	var $scaffold;

//	function index() {
//		$this->set("levels", $this->Level->find('all'));;
//	}

	/**
	 * @return bool
	 */
	function beforeRender() {

		if ($this->action == 'index') { // Hide json field since it's huge
			$this->viewVars['scaffoldFields'] = array_diff($this->viewVars['scaffoldFields'], array('json'));
		}
		return true;
	}
}
