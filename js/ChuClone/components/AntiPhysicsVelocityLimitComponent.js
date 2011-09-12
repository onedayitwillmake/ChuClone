/**
File:
	AntiPhysicsVelocityLimitComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	This component is attached after a player enters a portal, and basically removes the PhysicsVelocityLimit component until the next collision

 Basic Usage:
    var someEntity = new GameEntity();
    var velocityLimitComponent = new ChuClone.components.AntiPhysicsVelocityLimitComponent();
    someEntity.addComponentAndExecute( velocityLimitComponent );

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";

	ChuClone.namespace("ChuClone.components");
	ChuClone.components.AntiPhysicsVelocityLimitComponent = function() {
		ChuClone.components.AntiPhysicsVelocityLimitComponent.superclass.constructor.call(this);
        this._isWaitingToBeDetached = false;
        //this.requiresUpdate = true;
	};

	ChuClone.components.AntiPhysicsVelocityLimitComponent.prototype = {
        /**
         * @type {String}
         */
		displayName						: "AntiPhysicsVelocityLimitComponent",					// Unique string name for this Trait

        /**
         * Set to true when we detach, to prevent being called multiple times during a frame
         * @type {Boolean}
         */
        _isWaitingToBeDetached          : false,

		_motionStreak:null,

        /**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.AntiPhysicsVelocityLimitComponent.superclass.attach.call(this, anEntity);

            //this.attachedEntity.removeComponentWithName( ChuClone.components.PhysicsVelocityLimitComponent.prototype.displayName );

			// Attach a motionstreak component
            this.attachedEntity.addComponentAndExecute( new ChuClone.components.effect.MotionStreakComponent() );
			var physicsVelocityLimitComponent = this.attachedEntity.getComponentWithName( ChuClone.components.PhysicsVelocityLimitComponent.prototype.displayName );
			this._oldLimit = {x:physicsVelocityLimitComponent, yUp: physicsVelocityLimitComponent._maxSpeedYUp, yDown: physicsVelocityLimitComponent._maxSpeedYDown};
			physicsVelocityLimitComponent.setMaxSpeedXY( 110, 110, 110);

            this.intercept(['onCollision']);
        },

        /**
		 * When a collision is deteched, allow jumping
		 * @param {ChuClone.GameEntity} otherActor
		 */
        onCollision: function( otherActor ) {
			this.interceptedProperties['onCollision'].call( this.attachedEntity, otherActor );


            // If we hit another portal - ignore the collision, also ignore if we hit an object without an entity (world boundaries)
            if( !otherActor || otherActor.getComponentWithName( ChuClone.components.PortalComponent.prototype.displayName ) ) {
                return;
            }

            if(this._isWaitingToBeDetached) return;
            this._isWaitingToBeDetached = true;
            this.detachAfterDelay(1);
        },


        /**
         * Detaches a component from an 'attachedEntity' and restores the properties
         */
        detach: function() {
            //this.attachedEntity.addComponentAndExecute( new ChuClone.components.PhysicsVelocityLimitComponent );
			var physicsVelocityLimitComponent = this.attachedEntity.getComponentWithName( ChuClone.components.PhysicsVelocityLimitComponent.prototype.displayName );
			physicsVelocityLimitComponent.setMaxSpeedXY( this._oldLimit.x, this._oldLimit.yUp, this._oldLimit.yDown );

			this.attachedEntity.removeComponentWithName( ChuClone.components.effect.MotionStreakComponent.prototype.displayName );
            ChuClone.components.AntiPhysicsVelocityLimitComponent.superclass.detach.call(this);
        }


	};

    ChuClone.extend( ChuClone.components.AntiPhysicsVelocityLimitComponent, ChuClone.components.BaseComponent );
})();