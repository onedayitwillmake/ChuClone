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
		 * If we're running on the rails client we need to make sure we're doing /game/assets/whatever
		 * Cache a response and save it into models?
		 */
		getAssetPrefix: function() {
			return "";
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
        },


		/**
		 * Populates a DAT.GUI options controller with a given data-set
		 * @param {DAT.GUI.Controller} anOptionsGUI
		 * @param {Array} dataSet
		 * @param {Function} setOptionFieldsCallback	This function is called on each item, and an item from dataSet is given. This is the chance to give the option a nice label name
		 */
		repopulateOptionsGUI: function( anOptionsGUI, dataSet, setOptionFieldsCallback ) {

			// Example of a setOptionsFieldsCallback
			if(!setOptionFieldsCallback) {
				setOptionFieldsCallback |= function( aSelectOption, myData, index ) {
					aSelectOption.value = index;
					aSelectOption.innerText = myData.displayName;
					aSelectOption.label = myData.displayName.replace("Component", "");
				};
			}

			// Remove all current 'options' from the HTMLSelect element
			/**
			 * @type {HTMLSelectElement}
			 */
			var selectElement = anOptionsGUI.domElement.lastChild;
			while (selectElement.firstChild) {
				selectElement.removeChild(selectElement.firstChild);
			}

			// For each component this entity has - add an HTMLOptionElement to the drop down
			var allComponents = dataSet;
			var len = allComponents.length;
			var selectedIndex = 0;
			for( var i = 0; i < len; ++i ) {
				var aComponent = allComponents[i];

				/**
				 * @type {HTMLOptionElement}
				 */
				var selectOption = document.createElement('option');
				setOptionFieldsCallback( selectOption, aComponent, i );

				// Add it to the select options
				// .push does not work, but appending using the length does?
				var optionsLength = selectElement.options.length;
					selectElement.options[optionsLength] = selectOption;

//				// Set to last component that has editable properties
//				if( Object.keys(aComponent._editableProperties).length !== 0 ) {
//					selectedIndex = i;
//					selectOption.selected = true;
//				}
			}
		}


    };
})();