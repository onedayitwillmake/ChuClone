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
    var timeContext = null;
    ChuClone.gui.HUDController = {
        onDomReady: function(e) {
            window.removeEventListener('DOMContentLoaded', ChuClone.gui.HUDController.onDomReady, false);
            ChuClone.gui.HUDController.createTimeCanvas();

            // TODO: TEMP HACK TO ALLOW THE FONT TO LOAD
            setTimeout(ChuClone.gui.HUDController.setTimeInSeconds, 500, 999 * 1000 );
        },

        createTimeCanvas: function() {
            var container = document.getElementById("HUDTime");
            container.style.height = 50 + "px";
            container.textContent = "";

            var timeCanvas = document.createElement('canvas');
            timeCanvas.width = container.offsetWidth;
            timeCanvas.height = container.offsetHeight;
            container.appendChild(timeCanvas);

            var context = timeCanvas.getContext("2d");
            context.font = "48px Jura";
            context.textAlign = "right";
            context.textBaseline = "top";
            context.fillStyle = "rgba(32, 45, 21, " + 1 + ")";

            

            timeContext = context;
            timeContext.width = container.offsetWidth;
            timeContext.height = container.offsetHeight;
        },

        /**
         * Display a time in the HUDTime element
         * @param aTime
         */
        setTimeInSeconds: function( aTime ) {
            var seconds = Math.round(aTime/1000*10)/10 + " secs";
            timeContext.clearRect(0, 0, timeContext.width, timeContext.height);
            timeContext.fillText(seconds, timeContext.width - 40, 0);
        }
    };

    window.addEventListener('DOMContentLoaded', ChuClone.gui.HUDController.onDomReady, false);
})();