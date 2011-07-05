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

*/
(function(){
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
        _maxSpeed                       : new Box2D.Common.Math.b2Vec2(1, 0.5),

        update: function() {
            var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
            var body = this.attachedEntity.getBody();

            if(body.m_linearVelocity.y < -this._maxSpeed.y * PTM_RATIO) {
                body.m_linearVelocity.y = -this._maxSpeed.y * PTM_RATIO;
            }
        }
	};

    ChuClone.extend( ChuClone.components.PhysicsVelocityLimitComponent, ChuClone.components.BaseComponent );
})();