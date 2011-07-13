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

    <?php
        include("build.php");
    ?>

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
    <div id="editorContainer" class="grid_12" style="height: 540px;">
    </div>
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
        $perRow = 6;            // These are the last columns in our set, enable special class for end
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