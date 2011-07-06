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

    var SUPERREF;
	ChuClone.components.CharacterControllerComponent = function() {
		ChuClone.components.CharacterControllerComponent.superclass.constructor.call(this);
        this.requiresUpdate = true;
	};

	ChuClone.components.CharacterControllerComponent.prototype = {
        /**
         * @type {String}
         */
		displayName						: "CharacterControllerComponent",					// Unique string name for this Trait

        /**
         * @type {Number}
         */
        _moveSpeed                       : new Box2D.Common.Math.b2Vec2(0.015, 0.3),

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.CharacterControllerComponent.superclass.attach.call(this, anEntity);

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
            var impulse = new Box2D.Common.Math.b2Vec2(this._moveSpeed.x * PTM_RATIO * body.GetMass() * force.x, this._moveSpeed.y * PTM_RATIO * body.GetMass() * force.y);
            body.ApplyImpulse(impulse, bodyPosition);
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
            // remove input component
            this.attachedEntity.removeComponentWithName( ChuClone.components.KeyboardInputComponent.prototype.displayName );
            this._input = null;

            ChuClone.components.CharacterControllerComponent.superclass.detach.call(this);
        },


        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.CharacterControllerComponent.superclass.getModel.call(this);
            returnObject.moveSpeed = {x:0.1, y:0.3};
            
            return returnObject;
        }
	};

    ChuClone.extend( ChuClone.components.CharacterControllerComponent, ChuClone.components.BaseComponent );
})();