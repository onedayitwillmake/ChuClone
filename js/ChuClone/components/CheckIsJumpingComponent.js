/**
 File:
    CheckIsJumpingComponent.js
 Created By:
    Mario Gonzalez
 Project    :
    ChuClone
 Abstract:
 	Controls a property _canJump, which is set when an entity collides with something
    Creates a fixture and attaches it to an entity's Box2D body
 Basic Usage:

  License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";
    
    var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;
    
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
        _canJump                        : false,

        /**
         * Creates a fixture and attaches to the attachedEntity's Box2D body
         */
        attach: function( anEntity ) {
            ChuClone.components.CheckIsJumpingComponent.superclass.attach.call(this, anEntity);

            var entityBody = anEntity.getBody();
            var x = entityBody.GetPosition().x;
            var y = entityBody.GetPosition().y;
            var width = anEntity.getDimensions().width / PTM_RATIO;
            var height = anEntity.getDimensions().height / PTM_RATIO;
			var buffer = 0.1;

            var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
            fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
            fixtureDef.shape.SetAsBox( width+buffer, height +buffer);
                                       //SetAsEdge(new Box2D.Common.Math.b2Vec2(-width-buffer, -width-buffer), new Box2D.Common.Math.b2Vec2(width+buffer, width+buffer));
            var fixture = entityBody.CreateFixture(fixtureDef);
            fixture.SetSensor(true);
            fixture.m_filter.groupIndex = ChuClone.components.CharacterControllerComponent.prototype.GROUP;

            this._sensor = fixture;
            this._sensor.SetUserData( this );
        },

		/**
		 * When a collision is deteched, allow jumping
		 * @param {ChuClone.GameEntity} otherActor
		 */
        onCollision: function( otherActor ) {
             this._canJump = true;
        },

        /**
         * @inheritDoc
         */
        detach: function() {
            this.attachedEntity.getBody().DestroyFixture(this._sensor);
            this._sensor = null;

            ChuClone.components.CheckIsJumpingComponent.superclass.detach.call(this);
        }
	};

    ChuClone.extend( ChuClone.components.CheckIsJumpingComponent, ChuClone.components.BaseComponent );
})();