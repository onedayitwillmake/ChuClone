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
			}
		},

		/**
		 * The rails application will return HTML when validation fails, even though we're sending the request via XHR
		 * However the error messages are contained in 'pre' tags - so search the string for those and return them in an array
		 * @param {String} responseText
		 * @return {Array} An array of error message strings
		 */
		getValidationErrors: function( responseText ) {
			var match = null;
			var regex = /<pre>(.*?)<\/pre>/ig
			var match = regex.exec(responseText);

			return match[1].substring(String("Validation failed: ").length).split(",");
		},

		/**
		 * Gets the validations errors, but as returned from a nice JSON string, instead of a inside HTML <pre> tags
		 * @param {JSON} responseJSON
		 */
		getValidationErrorsFromJSON: function( responseJSON ) {
			var errors = [];

			for( var prop in responseJSON ) {
				for( var i = 0; i < responseJSON[prop].length; i++) {
					errors.push( prop + " " +responseJSON[prop][i] );
				}
			}
			return errors;
		},

		/**
		 * Given an ID - constructs a URL for retrieving a level at that location
		 * @param idString
		 */
		constructURLForLevelWithID: function( idString ) {
			return ChuClone.model.Constants.SERVER.LEVEL_LOAD_LOCATION + idString + ".js" + "?r="+Math.floor(Math.random()*1000);
		},

		/**
		 * Flashes a message on the notices panel in the editor
		 * @param {String|Array} message	An error message, can be a string or an array
		 * @param {Number} level	Error level: 0 = bad, 1 = good
		 */
        displayFlash: function(message, level) {
            if (level === undefined) {
                throw "Must suply level - either 1 or 0"
            }
            var logLevels = [console.error, console.info];
            var colorLevels = [
                {r: 255, g: 128, b: 128},
                {r: 79, g: 213, b: 101}
            ];


            var flashNotice = document.getElementById("flash_notice");
            if (!flashNotice) {
                logLevels[level]("ChuClone.Utils.displayFlash", message);
                return;
            }

            var output = message;
            if(message instanceof Array) {
                output = ''; // Set as empty string
                for(var i = 0; i < message.length; i++) {
                    output += message[i]+"<br>"
                }
            } else {
            }

            flashNotice.innerHTML = output;

			// Fade back to white
            new TWEEN.Tween(colorLevels[level])
                .to({r: 255, g: 255, b: 255}, 2000)
                .easing(TWEEN.Easing.Quadratic.EaseInOut)
                .onUpdate(
                function() {
                    flashNotice.style.backgroundColor = "rgb(" + (this.r << 0) + "," + (this.g << 0) + "," + (this.b << 0) + ")";
                }).start();
        }

    };
})();