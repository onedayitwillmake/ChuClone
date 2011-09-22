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
            this.setupDivs("levellisting");
            this.setupDivs("user_levellisting");
            this.setupDivs("beta_levellisting");
        },

        /**
         * Setup 'click' eventlistener for each level item
         */
        setupDivs: function( container_id ) {
            var levelListing = document.getElementById(container_id);
            if( !levelListing ) return;
            for (var i = 0; i < levelListing.children.length; ++i) {
                var item = levelListing.children[i];

                // No data
                if( item.getAttribute("data-id") == "" )  {
                    item.style.opacity = "0.4";
                    continue;
                }

                ChuClone.utils.setTextAndScaleToFit( item, item.innerHTML );
                item.addEventListener('click', this.onLevelClicked, false);
                item.addEventListener('mouseover', this.onLevelRollover, false);
            }
        },


		/**
		 * Called once the level list has been loaded
		 * @param request
		 */
		populateServerLevelList: function(request) {
            var container = document.createElement("div");
            container.id = "levellistingcontainer";
            container.style.zIndex= "1";
            container.style.position = "absolute";
            container.setAttribute("class", "container_16");

             var levelListingElement = document.createElement("div");
             levelListingElement.id = "levellisting";
            levelListingElement.style.position = "absolute";
            levelListingElement.style.top = "25px";
            levelListingElement.style.left = "170px";
            container.appendChild(levelListingElement);


            //"<div data-location='' data-id='105' class='grid_2 levelThumbnail' ><p>Slinkee</p></div>"
			var that = this;
			var levelListing = JSON.parse(request.responseText);
            for (var i = 0; i < levelListing.length; ++i) {
                var levelInfo = levelListing[i].level;



                var levelItem = document.createElement("div");
                levelItem.setAttribute("data-id", levelInfo.id);
                levelItem.setAttribute('class', "grid_2 grayBorder");
                levelItem.innerHTML = levelInfo.title
                levelItem.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
                levelItem.style.marginBottom = "5px";
                //level

                if(i % 4 == 0 && i > 1) {
                    var clear = document.createElement("div");
                    clear.setAttribute("class", "clear");
                    levelListingElement.appendChild(clear);
                }
                levelListingElement.appendChild( levelItem );
            }

            document.getElementsByTagName('body')[0].appendChild(container);
            this.setupDivs();
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
				//this.target.style["background-image"] = "url(/game/assets/images/page/levelthumbnails/sunsetmountain.png)"
            }).start();
        },
        
        onLevelRollout: function() {
            this.rollOut =  new TWEEN.Tween({target: this, size:3}).to({size: 0}, 150 ).easing( TWEEN.Easing.Quadratic.EaseInOut).onUpdate(function(){
                this.target.style["box-shadow"] = "inset 0 0 0 " + (this.size << 0) + "px #888";
				//this.target.style["background-image"] = "";
            }).start();
        },



		/**
		 * Load the sleected level
		 */
        onLevelClicked: function() {

            var aURL = ChuClone.utils.constructURLForLevelWithID(this.getAttribute("data-id"));
            ChuClone.Events.Dispatcher.emit(ChuClone.gui.LevelListing.prototype.EVENTS.SHOULD_CHANGE_LEVEL, aURL);

            // Don't change the history state if on kongregate
            if( !ChuClone.model.Constants.IS_KONGREGATE() ) {
                history.pushState(null, null, "/game/"+this.getAttribute("data-id"));
            } else {
                document.getElementById('levellistingcontainer').style.display = 'none';
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