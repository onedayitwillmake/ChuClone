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
		}
    };
})();