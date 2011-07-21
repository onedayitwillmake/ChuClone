/**
File:
	MovingPlatformComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	Respawns an entity if it falls below certain bounds

 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";
	ChuClone.namespace("ChuClone.components");
	ChuClone.components.MovingPlatformComponent = function() {
		ChuClone.components.MovingPlatformComponent.superclass.constructor.call(this);
		this.requiresUpdate = true;
	};

	ChuClone.components.MovingPlatformComponent.prototype = {
		displayName	: "MovingPlatformComponent",					// Unique string name for this Trait

		/**
		 * @type {Box2D.Common.Math.b2Vec2}
		 */
		_range	: new Box2D.Common.Math.b2Vec2(5, 0),

		/**
		 * Speed that this platform moves left or right
		 * @type {Number}
		 */
		_speed	: 0.01,

		/**
		 * @type {Box2D.Common.Math.b2Vec2}
		 */
		_initialPosition	: null,

		_angle	: 0,

		/**
		 * Overwrite to allow component specific GUI
		 */
		_editableProperties: {rangeX: 5, rangeY: 0, speed: {value: 0, max: 1, min: 0}},

		/**
		 * @inheritDoc
		 */
		attach: function( anEntity ) {
			ChuClone.components.MovingPlatformComponent.superclass.attach.call( this, anEntity );
			this._initialPosition = this.attachedEntity.getBody().GetPosition().Copy();
			this._position = this._initialPosition.Copy();
		},

		/**
		 * Modify the entity to move along axis as defined by sin/cos * range
		 */
		update: function() {
			if( this._range.x !== 0 )
				this._position.x = this._initialPosition.x + Math.cos(this._angle) * this._range.x;
			if( this._range.y !== 0 )
				this._position.y = this._initialPosition.y + Math.sin(this._angle) * this._range.y;

			this.attachedEntity.getBody().SetPosition( this._position.Copy() );
			this._angle += this._speed;
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
			this.attachedEntity.getBody().SetPosition( this._initialPosition.Copy() );
			this._initialPosition = null;
			this._position = null;
			ChuClone.components.MovingPlatformComponent.superclass.detach.call(this);
        },

		/**
		 * @inheritDoc
		 */
		onEditablePropertyWasChanged: function() {
			this._range.x = this._editableProperties.rangeX;
			this._range.y = this._editableProperties.rangeY;
			this._speed = this._editableProperties.speed.value;
		},

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.MovingPlatformComponent.superclass.getModel.call(this);
            returnObject.range = {x: this._range.x, y: this._range.y};
            returnObject.speed = this._speed;
            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data ) {
            ChuClone.components.MovingPlatformComponent.superclass.fromModel.call(this, data);
            this._range = new Box2D.Common.Math.b2Vec2( data.range.x, data.range.y );
			this._speed = data.speed;
        }

	};

    ChuClone.extend( ChuClone.components.MovingPlatformComponent, ChuClone.components.BaseComponent );
})();