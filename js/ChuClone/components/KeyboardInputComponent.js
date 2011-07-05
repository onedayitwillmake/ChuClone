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

*/
(function(){
	ChuClone.namespace("ChuClone.components");

	ChuClone.components.KeyboardInputComponent = function() {
		ChuClone.components.KeyboardInputComponent.superclass.constructor.call(this);
        this._maxSpeed = this._maxSpeed * ChuClone.Constants.PTM_RATIO;
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
         * @type {Number}
         */
        _maxSpeed                       : 0.5,

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
			ChuClone.components.JumpPadComponent.superclass.attach.call(this, anEntity);
		},

        execute: function() {
            ChuClone.components.JumpPadComponent.superclass.execute.call(this);

            var that = this;
            this._callback = function(e){
                if(e.type == "keyup") that.handleKeyUp(e);
                else if( e.type === "keydown") that.handleKeyDown(e);
            };

            window.addEventListener('keydown', this._callback, false);
            window.addEventListener('keyup', this._callback, false);
        },

        handleKeyDown: function( e ) {
            if( e.keyCode == ChuClone.Constants.KEYS.LEFT || e.keyCode == ChuClone.Constants.KEYS.A ) this._keyStates.left = true;
            else if(  e.keyCode == ChuClone.Constants.KEYS.RIGHT || e.keyCode == ChuClone.Constants.KEYS.D ) this._keyStates.right = true;
            if( e.keyCode == ChuClone.Constants.KEYS.UP || e.keyCode == ChuClone.Constants.KEYS.W ) this._keyStates.up = true;
            else if( e.keyCode == ChuClone.Constants.KEYS.DOWN || e.keyCode == ChuClone.Constants.KEYS.S ) this._keyStates.down = true;
        },

        handleKeyUp: function(e) {
            if( e.keyCode == ChuClone.Constants.KEYS.LEFT || e.keyCode == ChuClone.Constants.KEYS.A ) this._keyStates.left = false;
            else if(  e.keyCode == ChuClone.Constants.KEYS.RIGHT || e.keyCode == ChuClone.Constants.KEYS.D ) this._keyStates.right = false;
            if( e.keyCode == ChuClone.Constants.KEYS.UP || e.keyCode == ChuClone.Constants.KEYS.W ) this._keyStates.up = false;
            else if( e.keyCode == ChuClone.Constants.KEYS.DOWN || e.keyCode == ChuClone.Constants.KEYS.S ) this._keyStates.down = false;
        },

        /**
         * Restore material and restitution
         */
        detach: function() {

            document.removeEventListener('keydown', this._callback, false);
            document.removeEventListener('keyup', this._callback, false);
            this._callback = null;

            ChuClone.components.JumpPadComponent.superclass.detach.call(this);
        }

//        /**
//         * @inheritDoc
//         */
//        getModel: function() {
//            var returnObject = ChuClone.components.JumpPadComponent.superclass.getModel.call(this);
//            returnObject.restitution = this._restitution;
//            returnObject.textureSource = this._textureSource;
//            returnObject.previousRestitution = this._previousRestitution;
//
//            return returnObject;
//        }

	};

    ChuClone.extend( ChuClone.components.KeyboardInputComponent, ChuClone.components.BaseComponent );
})();