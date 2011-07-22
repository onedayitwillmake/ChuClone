<?php
/**
 * Created by IntelliJ IDEA.
 * User: onedayitwillmake
 * Date: 7/21/11
 * Time: 12:13 AM
 * To change this template use File | Settings | File Templates.
 */
 
class LevelsController extends AppController {
	var $components = array('RequestHandler');
	var $helpers = array("Html", "Form", "Javascript");
	var $name = "Levels";
	var $scaffold;

//	function indexjson() {
//    	$levels = $this->Level->find('all');
//    	$this->set(compact('levels'));
//    	$this->set("data", $this->data);
//	}
//	/*
	function indexjson() {
		$this->layout = 'ajax';
    	$levels = $this->Level->find('all');
    	$this->set(compact('levels'));
    	$this->set("data", $this->data);
	}
	/*

	function view($id) {
		$level = $this->Level->findById($id);
		$this->set(compact('level'));
	}

	function edit($id) {
		$this->Level->id = $id;
		if ($this->Level->save($this->data)) {
			$message = 'Saved';
		} else {
			$message = 'Error';
		}
		$this->set(compact("message"));
  	}

	function delete($id) {
		if($this->Level->delete($id)) {
			$message = 'Deleted';
		} else {
			$message = 'Error';
		}
		$this->set(compact("message"));
	}
	*/

	function delete($id) {
		if($this->Level->delete($id)) {
			$message = 'Deleted';
		} else {
			$message = 'Error';
		}
		$this->set(compact("message"));
	}
}
