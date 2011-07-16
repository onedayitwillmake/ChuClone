<?php
/**
 * Created by IntelliJ IDEA.
 * User: onedayitwillmake
 * Date: 7/16/11
 * Time: 5:16 PM
 * To change this template use File | Settings | File Templates.
 */
// TIMESTAMP - (removed) - date('ymdGis')
	$fileName = "../" . $_POST['levelName'] . "_t.json";
	$fileHandler = fopen($fileName, 'w');
	$levelData = str_replace("\\", "", $_POST['data']); // replace weird \ issue
	fwrite($fileHandler, $levelData);
	echo $levelData;
	fclose($fileHandler);
 ?>