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

	ChuClone.components.GoalPadComponent = function() {
		ChuClone.components.GoalPadComponent.superclass.constructor.call(this);
	};

	ChuClone.components.GoalPadComponent.prototype = {
		displayName						: "GoalPadComponent",					// Unique string name for this Trait

		/**
		 * @type {String}
		 */
        _textureSource                  : "assets/images/game/floorgreen.png",

		/**
		 * @type {THREE.Material}
		 */
        _previousMaterial               : null,

		/**
		 * @type {Boolean}
		 */
        _isReady                        : true,

		/**
		 * @type {Function}
		 */
		_playerCallback					: Function,

        EVENTS: {
            GOAL_REACHED    : "GoalPadComponent.events.goalReached"
        },

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.GoalPadComponent.superclass.attach.call(this, anEntity);
            // Intercept collision
            this.intercept(['onCollision']);

			var that = this;
			this.playerCallback = function(){
				that._isReady = true;
			};

			ChuClone.Events.Dispatcher.addListener( ChuClone.components.player.CharacterControllerComponent.prototype.EVENTS.CREATED, this.playerCallback );
		},

        execute: function() {
            ChuClone.components.GoalPadComponent.superclass.execute.call(this);

            var view = this.attachedEntity.getView();
            var body = this.attachedEntity.getBody();

            // Swap materials
            this._previousMaterial = view.materials[0];
            view.materials[0] = new THREE.MeshLambertMaterial( {
                color: 0xFFFFFF, shading: THREE.SmoothShading,
                map : ChuClone.utils.TextureUtils.GET_TEXTURE( ChuClone.model.Constants.SERVER.ASSET_PREFIX + this._textureSource )
            });
        },

        onCollision: function( otherActor ) {
            if( otherActor._type != ChuClone.model.Constants.ENTITY_TYPES.PLAYER )
                return;
            
            this.interceptedProperties.onCollision.call(this.attachedEntity, otherActor );
            if( !this._isReady ) return;
			this._isReady = false;
            ChuClone.Events.Dispatcher.emit( ChuClone.components.GoalPadComponent.prototype.EVENTS.GOAL_REACHED, this );
        },


        /**
         * Restore material and restitution
         */
        detach: function() {
            this.attachedEntity.getView().materials[0] = this._previousMaterial;

			if(this.playerCallback) {
				ChuClone.Events.Dispatcher.removeListener( ChuClone.components.player.CharacterControllerComponent.prototype.EVENTS.CREATED, this.playerCallback );
				this.playerCallback = null;
			}

//			this.attachedEntity.removeComponentWithName( ChuClone.components.effect.ParticleEmitterComponent.prototype.displayName );
            ChuClone.components.GoalPadComponent.superclass.detach.call(this);
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.GoalPadComponent.superclass.getModel.call(this);
            returnObject.textureSource = this._textureSource;

            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data, futureEntity ) {
            ChuClone.components.GoalPadComponent.superclass.fromModel.call(this, data);
            this._textureSource = data.textureSource;
        }

	};

    ChuClone.extend( ChuClone.components.GoalPadComponent, ChuClone.components.BaseComponent );
})();