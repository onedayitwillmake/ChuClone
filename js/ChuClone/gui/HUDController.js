/**
File:
	HUDController.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	Controls Heads Up Display for the game. I.e.
    Time etc

 Basic Usage:

 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    ChuClone.namespace("ChuClone.gui");

    var domElementTime = null;
    ChuClone.gui.HUDController = {
        onDomReady: function(e) {
            window.removeEventListener('DOMContentLoaded', ChuClone.gui.HUDController.onDomReady, false);
            domElementTime = document.getElementById("HUDTime");
            domElementTime.style.position = "position-fixed";
            domElementTime.style.width = "150px";
            domElementTime.style.backgroundColor = "#cccccc";
            domElementTime.style.textAlign = "center";



            ChuClone.gui.HUDController.setTimeInSeconds( 123 )
        },

        /**
         * Display a time in the HUDTime element
         * @param aTime
         */
        setTimeInSeconds: function( aTime ) {
            domElementTime.innerHTML = Math.round(aTime/60*10)/100 + " secs";
        }
    };

    window.addEventListener('DOMContentLoaded', ChuClone.gui.HUDController.onDomReady, false);
})();