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

        _textureSource                  : "assets/images/game/floorgreen.png",
        _previousMaterial               : null,

        _inactiveDelay                  : 1000,
        _isReady                        : true,
        _isReadyTimeout                 : null,


        EVENTS: {
            GOAL_REACHED    : "GoalPadComponent.events.goalReached"
        },

        /**
         * @type {ChuClone.components.GoalPadComponent}
         */
        CURRENT_RESPAWN : null,

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.GoalPadComponent.superclass.attach.call(this, anEntity);
            // Intercept collision
            this.intercept(['onCollision']);

//			var particleEmitterComponent = new ChuClone.components.effect.ParticleEmitterComponent();
//			this.attachedEntity.addComponentAndExecute( particleEmitterComponent );
//			this.attachedEntity.getView().parent.addChild( particleEmitterComponent._system );
		},

        execute: function() {
            ChuClone.components.GoalPadComponent.superclass.execute.call(this);

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

            console.log("GOAL!");
            ChuClone.Events.Dispatcher.emit( ChuClone.components.GoalPadComponent.prototype.EVENTS.GOAL_REACHED, this );
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
//			this.attachedEntity.removeComponentWithName( ChuClone.components.effect.ParticleEmitterComponent.prototype.displayName );
            ChuClone.components.GoalPadComponent.superclass.detach.call(this);
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.GoalPadComponent.superclass.getModel.call(this);
            returnObject.textureSource = this._textureSource;
            returnObject.inactiveDelay = this._inactiveDelay;

            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data ) {
            ChuClone.components.GoalPadComponent.superclass.fromModel.call(this, data);
            this._textureSource = data.textureSource;
            this._inactiveDelay = data.inactiveDelay;

        }

	};

    ChuClone.extend( ChuClone.components.GoalPadComponent, ChuClone.components.BaseComponent );
})();