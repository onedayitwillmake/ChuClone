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
<h1> ChuClone </h1>
<div class="container_12">
    <div class="grid_4">
        <p> Level Name </p>
    </div>
    <div class="grid_1 doMore prefix_1">
        <p><a href="https://github.com/onedayitwillmake/ChuClone">Fork on Github</a></p>
    </div>
    <div class="grid_1 doMore suffix_1">
        <p><a href="?editMode=true">Switch to Edit Mode</a></p>
    </div>
    <div class="grid_4 lineBorder omega" id="HUDTime">00.0 secs</div>
    <div class="clear"></div>
    <div id="gameContainer" class="grid_12"></div>
    <div id="editorContainer" class="grid_12" style="height: 540px;"></div>
    <div class="clear"></div>
    <div class="grid_12" style="height: 20px"></div>
    <div class="clear"></div>
    <div class="grid_6">
        <p>
            Select Level
        </p>
        <!--    BEGIN LEVEL LIST -->
    <?php
        $suffix = "assets/levels/";         // Append to every elvel
        $path = getcwd() . "/" . $suffix;   // Prefix to every url
        $dir_handle = @opendir($path) or die("Unable to open $path");

        $count = 0;
        $perRow = 3;            // These are the last columns in our set, enable special class for end
        // Loop through the files
        while ($file = readdir($dir_handle)) {
            if ($file == "." || $file == ".." || $file == "index.php")
                continue;

            $count++;
            $extraClass = ($count % $perRow) == 0 ? "levelThumbnailEOL" : "";

            $location = $suffix . $file;
            $levelName = str_replace(".json", "", $file);
            
            $template = <<<EOD
\t<div data-location="$levelName" class="grid_2 levelThumbnail $extraClass">\t$levelName\t</div>\n
EOD;
            echo $template;
        }
        closedir($dir_handle);
    ?>
        <!--    END LEVEL LIST -->
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