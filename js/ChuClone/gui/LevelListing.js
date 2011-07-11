/**
 File:
    BackgroundParticleManager.js
 Created By:
    Mario Gonzalez - mariogonzalez@gmail.com
 Project:
    ChuClone
 Abstract:
    Creates and manages background particles in the game.
    These particles have no effect on gameplay.

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
        _items    : [],

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

        onLevelClicked: function() {
            window.location.hash = this.getAttribute("data-location");
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