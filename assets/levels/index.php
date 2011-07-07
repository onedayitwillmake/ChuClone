<?php
/**
 * Created by IntelliJ IDEA.
 * User: mariogonzalez
 * Date: 7/7/11
 * Time: 4:39 PM
 * List levels
 */


// Define the full path to your folder from root
$path = getcwd(); //"./";

// Open the folder
$dir_handle = @opendir($path) or die("Unable to open $path");

// Loop through the files
while ($file = readdir($dir_handle)) {
    if ($file == "." || $file == ".." || $file == "index.php")
        continue;
    
    echo $file . "\n";
}

// Close
closedir($dir_handle);

