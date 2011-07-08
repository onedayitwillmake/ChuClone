/**
 File:
    CheckIsJumpingComponent.js
 Created By:
    Mario Gonzalez
 Project    :
    ChuClone
 Abstract:
    This
 Basic Usage:

  License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";
    
    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    
	ChuClone.namespace("ChuClone.components");
	ChuClone.components.CheckIsJumpingComponent = function() {
		ChuClone.components.CheckIsJumpingComponent.superclass.constructor.call(this);
	};

	ChuClone.components.CheckIsJumpingComponent.prototype = {
        /**
         * @type {String}
         */
		displayName						: "CheckIsJumpingComponent",					// Unique string name for this Trait

        /**
         * @type {Box2D.Dynamics.b2Fixture}
         */
        _sensor                         : null,
        _worldRef                       : null,
        _canJump                        : false,

        /**
         * @inheritDoc
         */
        attach: function( anEntity ) {
            ChuClone.components.CheckIsJumpingComponent.superclass.attach.call(this, anEntity);

            var entityBody = anEntity.getBody();
            var x = entityBody.GetPosition().x;
            var y = entityBody.GetPosition().y;
            var width = anEntity.getDimensions().width / PTM_RATIO + 1;
            var height = anEntity.getDimensions().height / PTM_RATIO + 0.5;

            var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
            fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
            fixtureDef.shape.SetAsEdge(new Box2D.Common.Math.b2Vec2(-1, -1), new Box2D.Common.Math.b2Vec2(1, 1));

            var fixture = entityBody.CreateFixture(fixtureDef);
            fixture.SetSensor(true);
            fixture.m_filter.groupIndex = ChuClone.PlayerEntity.prototype.GROUP;

            this._sensor = fixture;
            this._sensor.SetUserData( this );
        },

        onCollision: function( otherActor ) {
             this._canJump = true;
        },

        update: function() {
//            var pos = this.attachedEntity.getBody().GetPosition().Copy();
//            this._sensorBody.SetPositionAndAngle( pos, 0 );
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
            this.attachedEntity.getBody().DestroyFixture(this._sensor);
            this._sensor = null;

            ChuClone.components.CheckIsJumpingComponent.superclass.detach.call(this);
        }
	};

    ChuClone.extend( ChuClone.components.CheckIsJumpingComponent, ChuClone.components.BaseComponent );
})();