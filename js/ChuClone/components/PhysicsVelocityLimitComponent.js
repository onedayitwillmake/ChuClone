/**
File:
	PhysicsVelocityLimitComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	This component will limit an attachedEntity's physics body's LinearVelocity

 Basic Usage:
    var someEntity = new GameEntity();
    var velocityLimitComponent = new ChuClone.components.PhysicsVelocityLimitComponent();
    velocityLimitComponent.setMaxSpeed( 5, 5 );

    someEntity.addComponentAndExecute( velocityLimitComponent );

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";

	ChuClone.namespace("ChuClone.components");
	ChuClone.components.PhysicsVelocityLimitComponent = function() {
		ChuClone.components.PhysicsVelocityLimitComponent.superclass.constructor.call(this);
//		this._maxSpeed.Multiply( 3.0 );
        this.requiresUpdate = true;
	};

	ChuClone.components.PhysicsVelocityLimitComponent.prototype = {
        /**
         * @type {String}
         */
		displayName						: "PhysicsVelocityLimitComponent",					// Unique string name for this Trait

        /**
         * @type {Number}
         */
        _maxSpeed                       : new Box2D.Common.Math.b2Vec2(25, 0.4),

        update: function() {

            var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;
            var body = this.attachedEntity.getBody();

            // Cap X axis
            if( Math.abs(body.m_linearVelocity.x) > this._maxSpeed.x ) {
                body.m_linearVelocity.x = this._maxSpeed.x * (body.m_linearVelocity.x < 0 ? -1 : 1);
            }

            // only care about compromised Y up velocity
            if(body.m_linearVelocity.y < -this._maxSpeed.y * PTM_RATIO) {
                body.m_linearVelocity.y = -this._maxSpeed.y * PTM_RATIO;
            }
        },

        /**
         * Sets the maximum speed to maintain the attachedEntity at
         * @param x
         * @param y
         */
        setMaxSpeedXY: function( x, y ) {
            this._maxSpeed = new Box2D.Common.Math.b2Vec2( x, y );
        }
	};

    ChuClone.extend( ChuClone.components.PhysicsVelocityLimitComponent, ChuClone.components.BaseComponent );
})();