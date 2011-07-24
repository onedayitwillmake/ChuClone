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
            }
        },

		/**
		 * Load the sleected level
		 */
        onLevelClicked: function() {
//			console.log("ChuClone.editor.LevelManager.INSTANCE:", ChuClone.editor.LevelManager.INSTANCE)
//			ChuClone.editor.LevelManager.INSTANCE.clearLevel();
			if( this.getAttribute("data-location") != "" ) {
	            window.location.hash = this.getAttribute("data-location");
				ChuClone.Events.Dispatcher.emit( ChuClone.gui.LevelListing.prototype.EVENTS.SHOULD_CHANGE_LEVEL, this.getAttribute("data-location"));
			} else { // Use id to load from DB
				var aURL = "/levels/" + this.getAttribute("data-id") + ".js" + "?r="+Math.floor(Math.random()*1000);
				ChuClone.Events.Dispatcher.emit( ChuClone.gui.LevelListing.prototype.EVENTS.SHOULD_CHANGE_LEVEL, aURL);
				return;

				var id = this.getAttribute("data-id");
				var formData = new FormData();
				formData.append("id", id);

				var that = this;
				var request = new XMLHttpRequest();
				request.onreadystatechange = function() {
					if (request.readyState == 4) {
						console.log(request.responseText);
					}
				};

				request.open("GET", "/levels/" + id + ".js");
				request.send(formData);
			}
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