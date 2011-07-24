  /**
File:
	GoalBlockComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	When collision with player, fires a GoalBlockComponent.events.DID_REACH_GOAL event

 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";
    
	ChuClone.namespace("ChuClone.components");

	ChuClone.components.FrictionPadComponent = function() {
		ChuClone.components.FrictionPadComponent.superclass.constructor.call(this);
	};

	ChuClone.components.FrictionPadComponent.prototype = {
		displayName						: "FrictionPadComponent",					// Unique string name for this Trait

        _textureSource                  : "assets/images/game/floorred.png",
        _previousMaterial               : null,
		_damping						: 0.25,

        _inactiveDelay                  : 250,
        _isReady                        : true,
        _isReadyTimeout                 : null,


        EVENTS: {
            ON_COLLISION    : "FrictionPadComponent.events.onCollision"
        },

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.FrictionPadComponent.superclass.attach.call(this, anEntity);
            // Intercept collision
            this.intercept(['onCollision']);
		},

        execute: function() {
            ChuClone.components.FrictionPadComponent.superclass.execute.call(this);

            var view = this.attachedEntity.getView();
            var body = this.attachedEntity.getBody();

            // Swap materials
            this._previousMaterial = view.materials[0];
            view.materials[0] = new THREE.MeshLambertMaterial( {
                color: 0xFFFFFF, shading: THREE.SmoothShading,
                map : THREE.ImageUtils.loadTexture( ChuClone.model.Constants.SERVER.ASSET_PREFIX + this._textureSource )
            });
        },

        onCollision: function( otherActor ) {
            if( otherActor._type != ChuClone.model.Constants.ENTITY_TYPES.PLAYER )
                return;
            
            this.interceptedProperties.onCollision.call(this.attachedEntity, otherActor );
            if( !this._isReady ) return;

			var vel = otherActor.getBody().GetLinearVelocity();
            vel.x *= this._damping;
            vel.y *= this._damping;

            ChuClone.Events.Dispatcher.emit( ChuClone.components.FrictionPadComponent.prototype.EVENTS.ON_COLLISION, this );
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
        
        getIsReady: function() {
            return this._isReady;
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
            this.attachedEntity.getView().materials[0] = this._previousMaterial;
            ChuClone.components.FrictionPadComponent.superclass.detach.call(this);
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.FrictionPadComponent.superclass.getModel.call(this);
            returnObject.textureSource = this._textureSource;
            returnObject.inactiveDelay = this._inactiveDelay;
            returnObject.damping = this._damping;

            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data ) {
            ChuClone.components.FrictionPadComponent.superclass.fromModel.call(this, data);
            this._textureSource = data.textureSource || ChuClone.components.FrictionPadComponent.prototype._textureSource;
            this._inactiveDelay = data.inactiveDelay || ChuClone.components.FrictionPadComponent.prototype._inactiveDelay;
            this._damping = data.damping || ChuClone.components.FrictionPadComponent.prototype._damping;
        }

	};

    ChuClone.extend( ChuClone.components.FrictionPadComponent, ChuClone.components.BaseComponent );
})();