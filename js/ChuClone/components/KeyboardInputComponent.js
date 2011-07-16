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
    
	ChuClone.namespace("ChuClone.components");

	ChuClone.components.KeyboardInputComponent = function() {
		ChuClone.components.KeyboardInputComponent.superclass.constructor.call(this);
	};

	ChuClone.components.KeyboardInputComponent.prototype = {
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
			ChuClone.components.KeyboardInputComponent.superclass.attach.call(this, anEntity);
		},

        execute: function() {
            ChuClone.components.KeyboardInputComponent.superclass.execute.call(this);

            var that = this;
            this._callback = function(e){
                if(e.type == "keyup") that.handleKeyUp(e);
                else if( e.type === "keydown") that.handleKeyDown(e);
            };

            ChuClone.DOM_ELEMENT.addEventListener('keydown', this._callback, false);
            ChuClone.DOM_ELEMENT.addEventListener('keyup', this._callback, false);
        },

        handleKeyDown: function( e ) {
            if( e.keyCode == ChuClone.model.Constants.KEYS.A ) this._keyStates.left = true;
            else if(  e.keyCode == ChuClone.model.Constants.KEYS.D ) this._keyStates.right = true;
            if( e.keyCode == ChuClone.model.Constants.KEYS.W ) this._keyStates.up = true;
            else if( e.keyCode == ChuClone.model.Constants.KEYS.S ) this._keyStates.down = true;

            e.preventDefault();
        },

        handleKeyUp: function(e) {
            if( e.keyCode == ChuClone.model.Constants.KEYS.A ) this._keyStates.left = false;
            else if( e.keyCode == ChuClone.model.Constants.KEYS.D ) this._keyStates.right = false;
            if( e.keyCode == ChuClone.model.Constants.KEYS.W ) this._keyStates.up = false;
            else if( e.keyCode == ChuClone.model.Constants.KEYS.S ) this._keyStates.down = false;

            e.preventDefault();
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
            ChuClone.DOM_ELEMENT.removeEventListener('keydown', this._callback, false);
            ChuClone.DOM_ELEMENT.removeEventListener('keyup', this._callback, false);
            this._callback = null;

           ChuClone.components.KeyboardInputComponent.superclass.detach.call(this);
        }

	};

    ChuClone.extend( ChuClone.components.KeyboardInputComponent, ChuClone.components.BaseComponent );
})();