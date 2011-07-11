<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <title>ChuClone &mdash; Alpha</title>
    <link rel="stylesheet" href="assets/css/960/reset.css"/>
    <link rel="stylesheet" href="assets/css/960/text.css"/>
    <link rel="stylesheet" href="assets/css/960/960.css"/>
    <link rel="stylesheet" href="assets/css/960/demo.css"/>

    <link href="http://fonts.googleapis.com/css?family=Jura:300,400,500,600&v1" rel="stylesheet" type="text/css">
    <style>
        body {
            font-family: 'Jura', serif;
            font-size: 36px;
            font-style: normal;
            font-weight: 400;
            text-shadow: none;
            text-decoration: none;
            text-transform: none;
            letter-spacing: 0em;
            word-spacing: 0em;
            line-height: 1.2;
        }
    </style>

    <script type="text/javascript" src="js/lib/DAT.GUI.js"></script>

    <script type="text/javascript" src="js/lib/three.js/build/Three.js"></script>
    <script type="text/javascript" src="js/lib/three.js/examples/js/RequestAnimationFrame.js"></script>
    <script type="text/javascript" src="js/lib/three.js/examples/js/Stats.js"></script>
    <!--<script type="text/javascript" src="three.js/src/extras/sceneplotter/SceneEditor.js"></script>-->
    <!--<script type="text/javascript" src="three.js/src/extras/sceneplotter/SortedLookupTable.js"></script>-->
    <!--<script type="text/javascript" src="three.js/src/extras/sceneplotter/SceneWindow.js"></script>-->
    <!--<script type="text/javascript" src="three.js/src/extras/sceneplotter/ScenePlotterDot.js"></script>-->

    <script type="text/javascript" src="js/lib/Box2DWeb.js"></script>
    <script type="text/javascript" src="js/lib/EventEmitter.js"></script>
    <script type="text/javascript" src="assets/geometry/Bird.js"></script>
    <!--<script type="text/javascript" src="assets/geometry/spacesuit.js"></script>-->

    <script type="text/javascript" src="js/ChuClone/namespace.js"></script>
    <script type="text/javascript" src="js/ChuClone/Constants.js"></script>
    <script type="text/javascript" src="js/ChuClone/Utils.js"></script>

    <script type="text/javascript" src="js/ChuClone/gui/LevelListing.js"></script>

    <script type="text/javascript" src="js/ChuClone/components/BaseComponent.js"></script>
    <script type="text/javascript" src="js/ChuClone/components/JumpPadComponent.js"></script>
    <script type="text/javascript" src="js/ChuClone/components/RespawnPointComponent.js"></script>
    <script type="text/javascript" src="js/ChuClone/components/GoalPadComponent.js"></script>
    <script type="text/javascript" src="js/ChuClone/components/KeyboardInputComponent.js"></script>
    <script type="text/javascript" src="js/ChuClone/components/CheckIsJumpingComponent.js"></script>
    <script type="text/javascript" src="js/ChuClone/components/CharacterControllerComponent.js"></script>
    <script type="text/javascript" src="js/ChuClone/components/PhysicsVelocityLimitComponent.js"></script>
    <script type="text/javascript" src="js/ChuClone/components/camera/CameraFollowEditorComponent.js"></script>
    <script type="text/javascript" src="js/ChuClone/components/camera/CameraFollowPlayerComponent.js"></script>
    <script type="text/javascript" src="js/ChuClone/components/ComponentFactory.js"></script>

    <script type="text/javascript" src="js/ChuClone/Dispatcher.js"></script>
    <script type="text/javascript" src="js/ChuClone/editor/LevelModel.js"></script>
    <script type="text/javascript" src="js/ChuClone/editor/LevelManager.js"></script>
    <script type="text/javascript" src="js/ChuClone/editor/CameraGUI.js"></script>
    <script type="text/javascript" src="js/ChuClone/editor/WorldEditor.js"></script>
    <script type="text/javascript" src="js/ChuClone/physics/ContactListener.js"></script>
    <script type="text/javascript" src="js/ChuClone/physics/WorldController.js"></script>
    <script type="text/javascript" src="js/ChuClone/view/BackgroundParticleManager.js"></script>
    <script type="text/javascript" src="js/ChuClone/GameViewController.js"></script>
    <script type="text/javascript" src="js/ChuClone/GameEntity.js"></script>
    <script type="text/javascript" src="js/ChuClone/PlayerEntity.js"></script>
    <script type="text/javascript" src="js/ChuClone/ChuCloneGame.js"></script>
    <script type="text/javascript">
        var game = new ChuClone.ChuCloneGame();
    </script>
</head>
<body>
<h1>
    ChuClone
</h1>

<div class="container_12">
    <h3>
        
    </h3>

    <div class="grid_4">
        <p>
            Level Name
        </p>
    </div>
    <div class="grid_4">
        &nbsp;
    </div>
    <div class="grid_4">
        <p>
            00:00 secs
        </p>
    </div>
    <div class="clear"></div>
    <div id="gameContainer" class="grid_12">
    </div>
<!--    <div id="editorContainer" class="grid_12" style="height: 540px;">-->
<!--    </div>-->
    <div class="clear"></div>
    <div class="grid_6">
        <p>
            Select Level
        </p>

<!--    LIST LEVELS-->
    <?php
        $suffix = "assets/levels/";         // Append to every elvel
        $path = getcwd() . "/" . $suffix;   // Prefix to every url
        $dir_handle = @opendir($path) or die("Unable to open $path");

        $count = 0;
        $perRow = 6;            // These are the last columns in our set, enable special class for end these

        // Loop through the files
        while ($file = readdir($dir_handle)) {
            if ($file == "." || $file == ".." || $file == "index.php")
                continue;

            $count++;
            $extraClass = ($count % $perRow) == 0 ? "levelThumbnailEOL" : "";

            $location = $suffix . $file;
            $template = <<<EOD
            <div data-location="$location" class="grid_1 levelThumbnail $extraClass">
                <p>lvl $count</p>
            </div>
EOD;
            echo $template;
        }
        closedir($dir_handle);
    ?>
    </div>
    <div class="grid_6">
        <p>
            Level Information
        </p>
        <div class="grid_6 levelThumbnail">
                <p>Some Level details go here</p>
            </div>
    </div>
    <div class="clear"></div>
</div>

</body>
</html>