<?php
	$outputObject = array();
	$outputObject['levels'] = array();

	// Create a level object for each entry
	foreach($levels as &$levelObject) {
		$levelInfo = array();
		$levelInfo['id'] = $levelObject['Level']['id'];
		$levelInfo['author'] = $levelObject['Level']['creator_id'];
		$levelInfo['id'] = $levelObject['Level']['id'];
		$levelInfo['orderIndex'] = $levelObject['Level']['orderIndex'];
		array_push($outputObject['levels'], $levelInfo);
	}

	// Output as json
	echo json_encode($outputObject);
?>