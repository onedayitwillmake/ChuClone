
<levels>

	<?php
	foreach($levels as &$levelObject) {
		$levelData = $levelObject['Level']['json'];
		$node = <<<NODEEOL
		<levelNode><![CDATA[
			{$levelData}
		]]></levelNode>
NODEEOL;

		echo $node;
	}

	?>

</levels>