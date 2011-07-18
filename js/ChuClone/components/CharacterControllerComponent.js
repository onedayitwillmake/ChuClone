/**
File:
	CharacterControllerComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	This component will allow an entity to be controlled as a 'character'
 Basic Usage:

 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";
    
	ChuClone.namespace("ChuClone.components");

	ChuClone.components.CharacterControllerComponent = function() {
		ChuClone.components.CharacterControllerComponent.superclass.constructor.call(this);
        this.requiresUpdate = true;
	};

	ChuClone.components.CharacterControllerComponent.prototype = {
        /**
         * @type {String}
         */
		displayName			: "CharacterControllerComponent",					// Unique string name for this Trait

        /**
         * @type {Number}
         */
        _moveSpeed			: new Box2D.Common.Math.b2Vec2(0.009, 0.15),

		/**
		 * Object containing events we can dispatch
		 */
		EVENTS	: {
            CREATED: "PlayerEntity.event.created",
            REMOVED:   "PlayerEntity.event.removed"
        },
		/**
		 * Collision Group
		 * @type {Number}
		 */
		GROUP   : -1,
		_type	: ChuClone.model.Constants.ENTITY_TYPES.PLAYER,

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.CharacterControllerComponent.superclass.attach.call(this, anEntity);

			this.intercept(['_type']);

            // Attach kb control
            this._input = new ChuClone.components.KeyboardInputComponent();
            this.attachedEntity.addComponentAndExecute( this._input );

            // Attach sensor to check if jumping
            this._jumpCheckComponent = new ChuClone.components.CheckIsJumpingComponent();
            this.attachedEntity.addComponentAndExecute( this._jumpCheckComponent );
            this.attachedEntity.addComponentAndExecute( new ChuClone.components.BoundsYCheckComponent() );

			this.dispatchCreatedEvent();
		},

		/**
		 * @inheritDoc
		 */
        update: function() {
            var force = new Box2D.Common.Math.b2Vec2(0, 0);
            var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;
            var body = this.attachedEntity.getBody();

            // x-axis
            if (this._input._keyStates.left) force.x = -1;
            else if (this._input._keyStates.right) force.x = 1;
            // y-axis
            if (this._input._keyStates.up && this._jumpCheckComponent._canJump) {
                force.y = -1;
                this._jumpCheckComponent._canJump = false;

            } else if (this._input._keyStates.down) force.y = 0.25;

            // Apply force
            var bodyPosition = body.GetWorldCenter();
            var impulse = new Box2D.Common.Math.b2Vec2(this._moveSpeed.x * PTM_RATIO * body.GetMass() * force.x, this._moveSpeed.y * PTM_RATIO * body.GetMass() * force.y);
            body.ApplyImpulse(impulse, bodyPosition);
        },

		/**
         * Dispatches the created event via timeout so that it can be called the "next frame"
         */
        dispatchCreatedEvent: function() {
            var that = this;
            setTimeout(function(){
                ChuClone.Events.Dispatcher.emit( ChuClone.components.CharacterControllerComponent.prototype.EVENTS.CREATED, that.attachedEntity);
            }, 16);
        },

		/**
         * @inheritDoc
         */
        setBody: function( aBody ) {
			this.interceptedProperties['setBody'].call( this.attachedEntity, aBody );
            aBody.GetFixtureList().m_filter.groupIndex = ChuClone.components.CharacterControllerComponent.prototype.GROUP;
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
            // remove input component
            this.attachedEntity.removeComponentWithName( ChuClone.components.KeyboardInputComponent.prototype.displayName );
            this._input = null;

            this._jumpCheckComponent = null;

			ChuClone.Events.Dispatcher.emit( ChuClone.components.CharacterControllerComponent.prototype.EVENTS.REMOVED, this.attachedEntity);
            ChuClone.components.CharacterControllerComponent.superclass.detach.call(this);
        },


        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.CharacterControllerComponent.superclass.getModel.call(this);
//            returnObject.moveSpeed = {x: this._moveSpeed.x, y: this._moveSpeed.y };
            
            return returnObject;
        },

		/**
         * @inheritDoc
         */
        fromModel: function( data ) {
            ChuClone.components.JumpPadComponent.superclass.fromModel.call(this, data);
//            this._moveSpeed = new Box2D.Common.Math.b2Vec2(data.moveSpeed.y, data.moveSpeed.y)
        }
	};

    ChuClone.extend( ChuClone.components.CharacterControllerComponent, ChuClone.components.BaseComponent );
})();