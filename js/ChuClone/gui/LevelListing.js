/**
 File:
    LevelListing.js
 Created By:
    Mario Gonzalez - mariogonzalez@gmail.com
 Project:
    ChuClone
 Abstract:
    This class manages the level selection boxes displayed on the page

 Basic Usage:

  License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";

    var instance = null;
    ChuClone.namespace("ChuClone.gui");
    ChuClone.gui.LevelListing = function() {};
    ChuClone.gui.LevelListing.getInstance = function() {
        if( instance == null ) {
            instance = new ChuClone.gui.LevelListing();

            window.addEventListener('DOMContentLoaded', function callback(e){
                window.removeEventListener('DOMContentLoaded', callback, false);
                instance.onReady();
            }, false);
        }
        return instance;
    };

    ChuClone.gui.LevelListing.prototype = {
        _items		: [],
		EVENTS		: {
			SHOULD_CHANGE_LEVEL: "ChuClone.gui.LevelListing.shouldChangeLevel"
		},

		/**
		 * Callback when the document is ready
		 */
        onReady: function() {
            this.setupDivs();
        },

        /**
         * Setup 'click' eventlistener for each level item
         */
        setupDivs: function( ) {
            var levelItems = document.getElementsByClassName("levelThumbnail");

            for (var i = 0; i < levelItems.length; ++i) {
                var item = levelItems[i];
                item.addEventListener('click', this.onLevelClicked, false);
                item.addEventListener('mouseover', this.onLevelRollover, false);
            }
        },

        onLevelRollover: function() {
            //border: 1px solid #666;
            this.style.marginLeft = "0"
            this.style.marginRight = "0"
            this.style.border = "3px";
            this.style.borderStyle = "solid";
            this.style.borderColor = "#666";
            console.log(this)
        },

		/**
		 * Load the sleected level
		 */
        onLevelClicked: function() {
			var aURL = ChuClone.utils.constructURLForLevelWithID( this.getAttribute("data-id")  );
			ChuClone.Events.Dispatcher.emit( ChuClone.gui.LevelListing.prototype.EVENTS.SHOULD_CHANGE_LEVEL, aURL);
			history.pushState(null, null, "/game/"+this.getAttribute("data-id"));
        },

        /**
         * Deallocate memory
         */
        dealloc: function() {

        }

        ///// ACCESSORS
    };

    // Force initialize
    ChuClone.gui.LevelListing.getInstance();
})();