<?php 

class NotesController extends JsonApiAppController {
	
	public $name = 'Notes';
	
	public function index() {
		$notes = $this->paginate();
		if (empty($notes)) {
			$this->ServerResponse->setMethodSuccess(false);
		}
		$this->ServerResponse->set($notes);
	}
	
	public function add() {
		if (!empty($this->RequestData->data)) {
			$this->Note->save($this->RequestData->data);
		}
	}
}

?>