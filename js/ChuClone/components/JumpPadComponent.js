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

// TODO: Move "_left", "_right" to enumeration
(function(){
    "use strict";
    
	ChuClone.namespace("ChuClone.components");

	ChuClone.components.JumpPadComponent = function() {
		ChuClone.components.JumpPadComponent.superclass.constructor.call(this);
        this._textureSource = ChuClone.components.JumpPadComponent.prototype._textureSource + "right.png";
	};

	ChuClone.components.JumpPadComponent.prototype = {
		displayName						: "JumpPadComponent",					// Unique string name for this Trait

        /**
         * @type {String}
         */
        _textureSource                  : "assets/images/game/jumppad_",

        /**
         * Left or right
         * @type {Number}
         */
        _textureOrientation             : 1,

        /**
         * @type {Number}
         */
        _force                          : 1500,

        /**
         * @type {THREE.Material}
         */
        _previousMaterial               : null,

        /**
         * Cannot be used until this much time passes since last hit
         * @type {Number}
         */
        _inactiveDelay                  : 500,

        /**
         * @type {Boolean}
         */
        _isReady                        : true,

        /**
         * setTimeout reference
         * @type {Number}
         */
        _isReadyTimeout                 : null,


        /**
		 * Overwrite to allow component specific GUI
		 */
		_editableProperties: {orientation: {value: 1, min: -1, max: 1, step: 1}},

        ORIENTATION: {
            0: "left",
            1: "right"
        },

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.JumpPadComponent.superclass.attach.call(this, anEntity);
            // Intercept collision
            this.intercept(['onCollision']);
		},

        /**
         * @inheritDoc
         */
        execute: function() {
            ChuClone.components.JumpPadComponent.superclass.execute.call(this);

            var view = this.attachedEntity.getView();
            var body = this.attachedEntity.getBody();

            // Swap materials
            this._previousMaterial = view.materials[0];
            view.materials[0] = new THREE.MeshLambertMaterial( {
                color: 0xFFFFFF, shading: THREE.SmoothShading,
                map : ChuClone.utils.TextureUtils.GET_TEXTURE( ChuClone.model.Constants.SERVER.ASSET_PREFIX + this._textureSource ) 
            });
        },

        /**
         * Called on collision with other actor
         * @param otherActor
         */
        onCollision: function( otherActor ) {
            if( otherActor._type != ChuClone.model.Constants.ENTITY_TYPES.PLAYER )
                return;
            
            this.interceptedProperties.onCollision.call(this.attachedEntity, otherActor );

            if( !this._isReady ) return; // Cannot rejump

            // Apply a force negating the bodies downward motion, and applying a vertical force of this._force
            var vel = otherActor.getBody().GetLinearVelocity();
            vel.y -= Math.abs(vel.y) + this._force / ChuClone.model.Constants.PTM_RATIO;

            // Apply a rotation to the body based on it's position relative to our center
			var distx = this.attachedEntity.getBody().GetPosition().x - otherActor.getBody().GetPosition().x;
			var angle = Math.min( distx / (this.attachedEntity.getDimensions().width/ChuClone.model.Constants.PTM_RATIO), 1) * Math.PI;

            // Note: We have to call it on a timeout for 'next frame', because Box2D locks certain body properties during the collision
			setTimeout( function() {
				otherActor.getBody().SetAngularVelocity( otherActor.getBody().GetAngularVelocity() - angle)
			}, 16);

            // Prevent double-jumping
            this.startWaitingForIsReady()
        },

        /**
         * Once set _isReady is locked for N milliseconds
         */
        startWaitingForIsReady: function() {
            var that = this;
            this._isReady = false;

            clearTimeout( this._isReadyTimeout );
            this._isReadyTimeout = setTimeout( function(){
                that._isReady = true;
            }, this._inactiveDelay);
        },

        /**
         * Set the '_editableProperties' object to our values
         */
        setEditableProps: function() {
			this._editableProperties.orientation.value = this._textureOrientation;
        },

        /**
		 * Modify the texture to face left or right
		 */
		onEditablePropertyWasChanged: function() {
            var newOrientation, imageSource;
            if(this._editableProperties.orientation.value >= 0) {
                newOrientation = 1;
                this._textureSource = ChuClone.components.JumpPadComponent.prototype._textureSource + "right.png";
            } else {
                newOrientation = 0;
                this._textureSource = ChuClone.components.JumpPadComponent.prototype._textureSource + "left.png";
            }

            // No change
            if( newOrientation == this._textureOrientation ) return;
            this._textureOrientation = newOrientation;

            // Load the image and set the texture
            var texture = this.attachedEntity.getView().materials[0];
            var img = new Image();
            img.src = ChuClone.model.Constants.SERVER.ASSET_PREFIX + this._textureSource;
            img.onload = function() {
                texture.map.needsUpdate = true;
                texture.map.image = this;
            };
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
            this.attachedEntity.getView().materials[0] = this._previousMaterial;
            ChuClone.components.JumpPadComponent.superclass.detach.call(this);
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.JumpPadComponent.superclass.getModel.call(this);
            console.log("T", this._textureSource)
            returnObject.textureSource = this._textureSource;
			returnObject.inactiveDelay = this._inactiveDelay;

            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data, futureEntity ) {
            ChuClone.components.JumpPadComponent.superclass.fromModel.call(this, data);
            this._textureSource = this.fixTextureSource( data.textureSource );
            this._inactiveDelay = data.inactiveDelay;
        },

        // TEMP FUNCTION DURING DEV
        fixTextureSource: function( originalSource ) {
            console.log(originalSource)
            if(originalSource.indexOf("_") == -1) {
                console.log("BAD SOURCE" + originalSource);
                return ChuClone.components.JumpPadComponent.prototype._textureSource + "right.png";
            }

            return originalSource;
        },

        ///// ACCESSORS
        getIsReady: function() { return this._isReady; }
	};

    ChuClone.extend( ChuClone.components.JumpPadComponent, ChuClone.components.BaseComponent );
})();