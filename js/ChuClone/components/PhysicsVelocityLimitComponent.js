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
        _maxSpeedX						: 22,
		/**
         * @type {Number}
         */
		_maxSpeedYUp					: 23.4,
		/**
         * @type {Number}
         */
		_maxSpeedYDown					: 23.4*3,
        //_maxSpeed                       : new Box2D.Common.Math.b2Vec2(2, 0.1),

        update: function() {

            var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;
            var body = this.attachedEntity.getBody();

            // Cap X axis
            if( Math.abs(body.m_linearVelocity.x) > this._maxSpeedX ) {
				//console.log("CapX", Math.abs(body.m_linearVelocity.x));
                body.m_linearVelocity.x = this._maxSpeedX * (body.m_linearVelocity.x < 0 ? -1 : 1);
            }

            // Cap Y up more strongly than Y down
            if(body.m_linearVelocity.y < -this._maxSpeedYUp) {
				//console.log("CapY UP", body.m_linearVelocity.y);
                body.m_linearVelocity.y = -this._maxSpeedYUp;
            }

			//only care about compromised Y up velocity
            if(body.m_linearVelocity.y > this._maxSpeedYDown) {
				//console.log("CapY DOWN", body.m_linearVelocity.y);
                body.m_linearVelocity.y = this._maxSpeedYDown;
            }
        },

        /**
         * Sets the maximum speed to maintain the attachedEntity at
         * @param x
         * @param y
         */
        setMaxSpeedXY: function( x, yUp, yDown) {
            this._maxSpeedX = x;
			this._maxSpeedYUp = yUp;
			this._maxSpeedYDown = yDown;
        }
	};

    ChuClone.extend( ChuClone.components.PhysicsVelocityLimitComponent, ChuClone.components.BaseComponent );
})();