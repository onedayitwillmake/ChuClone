/**
File:
	ChaseTrait.js
Created By:
	Mario Gonzalez
Project	:
	RealtimeMultiplayerNodeJS
Abstract:
 	This trait will cause an entity to chase a target
 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";
    
	ChuClone.namespace("ChuClone.components.player");

	ChuClone.components.player.KeyboardInputComponent = function() {
		this._callback = null;
		this._keyStates = {left:false, right:false, up:false, down: false};
		ChuClone.components.player.KeyboardInputComponent.superclass.constructor.call(this);
	};

	ChuClone.components.player.KeyboardInputComponent.prototype = {
        /**
         * @type {String}
         */
		displayName						: "KeyboardInputComponent",					// Unique string name for this Trait

        /**
         * @type {Function}
         */
        _callback                       :null,

        /**
         * Stores current status of each key
         * @type {Object}
         */
        _keyStates                      : {
            left: false,
            right: false,
            up: false,
            down: false
        },

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.player.KeyboardInputComponent.superclass.attach.call(this, anEntity);
		},

        execute: function() {
            ChuClone.components.player.KeyboardInputComponent.superclass.execute.call(this);

            var that = this;
            this._callback = function(e){
                if(e.type == "keyup") that.handleKeyUp(e);
                else if( e.type === "keydown") that.handleKeyDown(e);
            };

            ChuClone.DOM_ELEMENT.addEventListener('keydown', this._callback, false);
            ChuClone.DOM_ELEMENT.addEventListener('keyup', this._callback, false);
        },

		/**
		 * Dispatched when a key is press down, changes the state this component
		 * @param {Event} e
		 */
        handleKeyDown: function( e ) {
			var validChange = false;

            if( e.keyCode == ChuClone.model.Constants.KEYS.A ) { this._keyStates.left = true; validChange = true; }
            else if(  e.keyCode == ChuClone.model.Constants.KEYS.D ) { this._keyStates.right = true; validChange = true; }
            if( e.keyCode == ChuClone.model.Constants.KEYS.W ) { this._keyStates.up = true; validChange = true; }
            else if( e.keyCode == ChuClone.model.Constants.KEYS.S ) { this._keyStates.down = true; validChange = true; }

            if( validChange ) {
				e.preventDefault();
			}
        },

		/**
		 * Dispatched when a key is released, changes the state this component
		 * @param {Event} e
		 */
        handleKeyUp: function(e) {
			var validChange = false;
            if( e.keyCode == ChuClone.model.Constants.KEYS.A ) { this._keyStates.left = false; validChange = true; }
            else if( e.keyCode == ChuClone.model.Constants.KEYS.D ) { this._keyStates.right = false; validChange = true; }
            if( e.keyCode == ChuClone.model.Constants.KEYS.W ) { this._keyStates.up = false; validChange = true; }
            else if( e.keyCode == ChuClone.model.Constants.KEYS.S ) { this._keyStates.down = false; validChange = true; }

			if( validChange ) {
				e.preventDefault();
			}

        },

		/**
		 * Sets all keystates to false
		 */
		resetState: function() {
			this._keyStates.left = this._keyStates.right = this._keyStates.up = this._keyStates.down = false;
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
            ChuClone.DOM_ELEMENT.removeEventListener('keydown', this._callback, false);
            ChuClone.DOM_ELEMENT.removeEventListener('keyup', this._callback, false);
            this._callback = null;

           ChuClone.components.player.KeyboardInputComponent.superclass.detach.call(this);
        }

	};

    ChuClone.extend( ChuClone.components.player.KeyboardInputComponent , ChuClone.components.BaseComponent );
})();