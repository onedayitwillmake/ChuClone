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

	ChuClone.components.CharacterInputComponent = function() {
		ChuClone.components.CharacterInputComponent.superclass.constructor.call(this);
        this.requiresUpdate = true;
	};

	ChuClone.components.CharacterInputComponent.prototype = {
        /**
         * @type {String}
         */
		displayName						: "CharacterInputComponent",					// Unique string name for this Trait

        /**
         * @type {Number}
         */
        _maxSpeed                       : 0.5,

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.JumpPadComponent.superclass.attach.call(this, anEntity);

            this._input = new ChuClone.components.KeyboardInputComponent();
            this.attachedEntity.addComponentAndExecute( this._input );
		},

        update: function() {
            var force = new Box2D.Common.Math.b2Vec2(0, 0);
            var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
            var body = this.attachedEntity.getBody();

            // x-axis
            if (this._input._keyStates.left) force.x = -1;
            else if (this._input._keyStates.right) force.x = 1;
            // y-axis
            if (this._input._keyStates.up && !this._isJumping) {
                force.y = -1;
                this._isJumping = true;
            } else if (this._input._keyStates.down) force.y = 0.25;

            // Apply force
            var bodyPosition = body.GetWorldCenter();
            var impulse = new Box2D.Common.Math.b2Vec2(0.01 * PTM_RATIO * body.GetMass() * force.x, 0.3 * PTM_RATIO * body.GetMass() * force.y);
            body.ApplyImpulse(impulse, bodyPosition);
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
            // remove input component
            this.attachedEntity.removeComponentWithName( ChuClone.components.KeyboardInputComponent.prototype.displayName );
            this._input = null;

            ChuClone.components.JumpPadComponent.superclass.detach.call(this);
        }
	};

    ChuClone.extend( ChuClone.components.CharacterInputComponent, ChuClone.components.BaseComponent );
})();