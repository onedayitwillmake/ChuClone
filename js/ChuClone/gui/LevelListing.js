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
    var _lastItem = null;
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
            var levelListing = document.getElementById("levellisting");
            if( !levelListing ) { console.info("Could not find levellisting element. Aborting..."); return; }

            for (var i = 0; i < levelListing.children.length; ++i) {
                var item = levelListing.children[i];
                item.addEventListener('click', this.onLevelClicked, false);
                item.addEventListener('mouseover', this.onLevelRollover, false);
            }
        },

        onLevelRollover: function(e) {
            if( _lastItem == this ) return;

            // Kill last tween
            if( _lastItem ) {
                ChuClone.gui.LevelListing.prototype.onLevelRollout.call( _lastItem );
            }

            _lastItem = this;

            this.rollOver =  new TWEEN.Tween({target: this, size:0}).to({size: 3}, 150 ).easing( TWEEN.Easing.Quadratic.EaseInOut).onUpdate(function(){
                this.target.style["box-shadow"] = "inset 0 0 0 " + (this.size << 0) + "px #888"
            }).start();
        },
        
        onLevelRollout: function() {
            this.rollOut =  new TWEEN.Tween({target: this, size:3}).to({size: 0}, 150 ).easing( TWEEN.Easing.Quadratic.EaseInOut).onUpdate(function(){
                this.target.style["box-shadow"] = "inset 0 0 0 " + (this.size << 0) + "px #888"
            }).start();
        },



		/**
		 * Load the sleected level
		 */
        onLevelClicked: function() {
			var aURL = ChuClone.utils.constructURLForLevelWithID( this.getAttribute("data-id")  );
			ChuClone.Events.Dispatcher.emit( ChuClone.gui.LevelListing.prototype.EVENTS.SHOULD_CHANGE_LEVEL, aURL);
			history.pushState(null, null, ChuClone.utils.get);
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