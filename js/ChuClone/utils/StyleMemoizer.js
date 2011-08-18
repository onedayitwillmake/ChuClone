/**
 File:
 	StyleMemoizer.js
 Created By:
 	Mario Gonzalez
 Project:
 	ChuClone
 Abstract:
 	Singleton class with two functions, 'rememberStyle' and 'restoreStyle'
 	It's used to store the style properties of an object, so that it can be restored at a later time.
	For example when switching to fullscreen mode.

 Basic Usage:
 	// Save state
 	var flashNotice = document.getElementById("flash_notice");
 	ChuClone.utils.StyleMemoizer.rememberStyle( "flash_notice" );

 	// Modify properties
 	flashNotice.style['z-index'] = 1;
	flashNotice.style.backgroundColor = "#FFFFFF";
	flashNotice.style.opacity = 0.75;
	flashNotice.style.top = parseInt(editorContainer.style.top) - flashNotice.clientHeight - 10 + "px"

 	// Finally restore state
 	ChuClone.utils.StyleMemoizer.restoreStyle( "flash_notice" );

 License:
	 Creative Commons Attribution-NonCommercial-ShareAlike
	 http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
	ChuClone.namespace('ChuClone.utils');

	/**
	 * Utility functions to store styles before modification, and restore them after.
	 * For example when toggling fullscreen mode
	 */
	var props = ['z-index', 'position', 'top', 'left', 'display', 'visibility'];

	var storedStyles = {};
	ChuClone.utils.StyleMemoizer = {

		/**
		 * Gets the computed style of an element, and stores it so that restoreStyle can be called with that element later
		 * @param {String} id The elements id
		 */
		rememberStyle: function(id) {
			storedStyles[id] = {};
			var element = document.getElementById(id);
			for (var i = 0; i < props.length; i++) {
				var prop = props[i];
				storedStyles[id][prop] = window.getComputedStyle(element).getPropertyValue(prop);
			}
		},

		/**
		 * Restores the style of a particular element
		 * @param id
		 */
		restoreStyle: function(id) {
			if (!storedStyles[id]) {
				console.error("ChuClone.utils.styleMemoizer - Cannot restore style, none found!");
				return;
			}

			var element = document.getElementById(id);
			for (var i = 0; i < props.length; i++) {
				var prop = props[i];
				element.style[prop] = storedStyles[id][prop];
			}
		}

	};
})();