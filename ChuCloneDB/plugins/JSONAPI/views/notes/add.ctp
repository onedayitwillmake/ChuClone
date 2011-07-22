<h3>Add Note</h3>
<?php 
	echo $this->Form->create('Note', array('plugin' => 'json_api', 'controller' => 'notes', 'action' => 'add'));
	echo $this->Form->input('title');
	echo $this->Form->input('description');
	echo $this->Form->input('content');
	echo $this->Form->end('Save Note');
?>