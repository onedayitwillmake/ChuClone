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
        _moveSpeed                       : new Box2D.Common.Math.b2Vec2(0.015, 0.15),

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.CharacterControllerComponent.superclass.attach.call(this, anEntity);

            // Attach kb control
            this._input = new ChuClone.components.KeyboardInputComponent();
            this.attachedEntity.addComponentAndExecute( this._input );

            // Attach sensor to check if jumping
            this._jumpCheckComponent = new ChuClone.components.CheckIsJumpingComponent();
            this.attachedEntity.addComponentAndExecute( this._jumpCheckComponent );
		},

        update: function() {
            var force = new Box2D.Common.Math.b2Vec2(0, 0);
            var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
            var body = this.attachedEntity.getBody();
            this._jumpCheckComponent.update();

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
         * Once set _isReady is locked for N milliseconds
         */
        startWaitingForIsReady: function() {
            var that = this;
            this._isJumping = true;
            clearTimeout( this._isReadyTimeout );
            this._isReadyTimeout = setTimeout( function(){
                that._isJumping = false;
            }, 1900);
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