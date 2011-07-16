<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <title>ChuClone - Alpha</title>
    <link rel="stylesheet" href="assets/css/960/reset.css"/>
    <link rel="stylesheet" href="assets/css/960/text.css"/>
    <link rel="stylesheet" href="assets/css/960/960.css"/>
    <link rel="stylesheet" href="assets/css/ChuClone.css"/>

    <link href="http://fonts.googleapis.com/css?family=Jura:300,400,500,600&v1" rel="stylesheet" type="text/css">

    <?php
    include("build.php");
    ?>

    <script type="text/javascript">
        var game = new ChuClone.ChuCloneGame();
    </script>
</head>
<body>
<div class="container_12">
    <div class="clear"></div>
    <div id="gameContainer" class="grid_12"></div>
    <div id="editorContainer" class="grid_12" style="height: 540px;"></div>
	<div class="clear"></div>
	<div class="grid_4 lineBorder" id="HUDTime" style="margin-top:-10px">00.0 secs</div>
</div>
</body>
</html>