/**
 File:
    Utils.js
 Created By:
    Mario Gonzalez - mariogonzalez@gmail.com
 Project:
    ChuClone
 Abstract:
    A collection of static functions
 Basic Usage:

 Version:
    1.0

 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function() {
    ChuClone.namespace("ChuClone");
    ChuClone.utils = {

        /**
         * Reads window.location and returns the current working directory
         * @return {String} Current URL path
         */
        getCWD: function() {
            var parts = window.location.href.replace(/[^\/]*$/i,'');
            return parts;
        },

		/**
		 * Returns a random float between min and max
		 * @param {Number} min
		 * @param {Number} max
		 * @return {Number}
		 */
		randFloat: function( min, max ) {
			return (Math.random() * (max - min)) + min;
		},

		/**
         * Adds component stuff from GameEntity to the camera, bit of a hack
         * @param {THREE.Camera}
         */
        augmentCamera: function( aCamera ) {

			if( aCamera.hasOwnProperty('components') ) {
				console.error("CameraGUI.augmentCamera - Attempting to augment camera that already contains 'components' property ");
				return;
			}
            aCamera.components = [];
            for(var prop in ChuClone.GameEntity.prototype) {
                if(! ChuClone.GameEntity.prototype.hasOwnProperty(prop) ) return;

                // Steal all component related functions
                if(prop.toLowerCase().indexOf("component") !== -1 &&
                    ChuClone.GameEntity.prototype[prop] instanceof Function) {

                    // Throw error if camera already has such a property, probably something has gone wrong
                    aCamera[prop] = ChuClone.GameEntity.prototype[prop];
                }
            }

            // Augment the update function
            aCamera.superUpdate = aCamera.update;
            aCamera.update = function() {
                var len = this.components.length;
                for(var i = 0; i < len; ++i ) {
                    if( this.components[i].requiresUpdate ) {
                        this.components[i].update();
                    }
                }
                this.superUpdate.call( this );
            }
        }
    };
})();