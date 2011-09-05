/**
File:
	DeathPadComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	When collision with player, the player is sent back to the last respawn point

 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";

	ChuClone.namespace("ChuClone.components");

	ChuClone.components.DeathPadComponent = function() {
		ChuClone.components.DeathPadComponent.superclass.constructor.call(this);
        this._isReady = true;
	};

	ChuClone.components.DeathPadComponent.prototype = {
		displayName						: "DeathPadComponent",					// Unique string name for this Trait

        _textureSource                  : "assets/images/game/floordark.png",
        _previousMaterial               : null,

        _inactiveDelay                  : 1000,
        _isReady                        : true,
        _isReadyTimeout                 : null,


        EVENTS: {
            ACTIVATED    : "DeathPadComponent.events.activated"
        },

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.DeathPadComponent.superclass.attach.call(this, anEntity);
            // Intercept collision
            this.intercept(['onCollision']);
		},

         /**
         * @inheritDoc
         */
        execute: function() {
            ChuClone.components.DeathPadComponent.superclass.execute.call(this);

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
         * @inheritDoc
         */
        onCollision: function( otherActor ) {
            if( !otherActor || otherActor._type != ChuClone.model.Constants.ENTITY_TYPES.PLAYER )
                return;

            this.interceptedProperties.onCollision.call(this.attachedEntity, otherActor );
            if( !this._isReady ) return;


            // Respawn the entity on the next frame
            setTimeout( function() {
                ChuClone.components.RespawnComponent.prototype.GET_CURRENT_RESPAWNPOINT().setSpawnedEntityPosition( otherActor );
                otherActor.getBody().SetLinearVelocity( new Box2D.Common.Math.b2Vec2(0, 0) );
            }, 1);

            ChuClone.Events.Dispatcher.emit( ChuClone.components.DeathPadComponent.prototype.EVENTS.ACTIVATED, this );
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
            }, this._inactiveDelay );
        },

        ///// ACCESSORS
        getIsReady: function() {
            return this._isReady;
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
            this.attachedEntity.getView().materials[0] = this._previousMaterial;
            ChuClone.components.DeathPadComponent.superclass.detach.call(this);
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.DeathPadComponent.superclass.getModel.call(this);
            returnObject.textureSource = this._textureSource;
            returnObject.inactiveDelay = this._inactiveDelay;

            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data, futureEntity ) {
            ChuClone.components.DeathPadComponent.superclass.fromModel.call(this, data);
            this._textureSource = data.textureSource;
            this._inactiveDelay = data.inactiveDelay;
        }
	};

    ChuClone.extend( ChuClone.components.DeathPadComponent, ChuClone.components.BaseComponent );
})();