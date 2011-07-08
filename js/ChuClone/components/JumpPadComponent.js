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

	ChuClone.components.JumpPadComponent = function() {
		ChuClone.components.JumpPadComponent.superclass.constructor.call(this);

	};

	ChuClone.components.JumpPadComponent.prototype = {
		displayName						: "JumpPadComponent",					// Unique string name for this Trait

        _textureSource                  : "assets/images/game/jumppad.png",
        _force                          : 1500,
        _previousMaterial               : null,
        _isReady                        : true,
        _isReadyTimeout                 : null,

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.JumpPadComponent.superclass.attach.call(this, anEntity);
            // Intercept collision
            this.intercept(['onCollision']);
		},

        execute: function() {
            ChuClone.components.JumpPadComponent.superclass.execute.call(this);

            var view = this.attachedEntity.getView();
            var body = this.attachedEntity.getBody();

            // Swap materials
            this._previousMaterial = view.materials[0];
            view.materials[0] = new THREE.MeshLambertMaterial( {
                color: 0xFFFFFF, shading: THREE.SmoothShading,
                map : THREE.ImageUtils.loadTexture( this._textureSource )
            });
        },

        onCollision: function( otherActor ) {
            if( otherActor._type != ChuClone.Constants.ENTITY_TYPES.PLAYER )
                return;
            
            this.interceptedProperties.onCollision.call(this.attachedEntity, otherActor );

            if( !this._isReady ) return;

            var vel = otherActor.getBody().GetLinearVelocity();
            vel.y -= Math.abs(vel.y) + this._force / ChuClone.Constants.PTM_RATIO;

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
            }, 1000);
        },
        
        getIsReady: function() {
            return this._isReady;
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
            returnObject.textureSource = this._textureSource;

            return returnObject;
        }

	};

    ChuClone.extend( ChuClone.components.JumpPadComponent, ChuClone.components.BaseComponent );
})();