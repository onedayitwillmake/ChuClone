<!DOCTYPE HTML>
<html lang="en">
<head>
    <title>ChuClone</title>
    <meta charset="utf-8">
    <style type="text/css">
        body {
            font-family: Monospace;
            background-color: #FFFFFF;
            margin: 0px;
            overflow: hidden;
        }
    </style>
    <link  href="http://fonts.googleapis.com/css?family=Orbitron:400,500,700,900&v1" rel="stylesheet" type="text/css" >

    <?php
        include("build.php");
    ?>
    <script type="text/javascript">
        var game = new ChuClone.ChuCloneGame();
    </script>

    <!--<script type="text/javascript">-->
        <!--var _gaq = _gaq || [];-->
        <!--_gaq.push(['_setAccount', 'UA-1249241-1']);-->
        <!--_gaq.push(['_trackPageview']);-->

        <!--(function() {-->
            <!--var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;-->
            <!--ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';-->
            <!--var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);-->
        <!--})();-->
    <!--</script>-->
</head>
<body>
    <div id="guiContainer"></div>
</body>
</html>
