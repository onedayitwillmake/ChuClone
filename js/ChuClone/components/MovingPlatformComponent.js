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
		_range	: null,

		/**
		 * Speed that this platform moves left or right
		 * @type {Number}
		 */
		_speed	: 0.01,
		_offset : 0,

		/**
		 * @type {Box2D.Common.Math.b2Vec2}
		 */
		_initialPosition	: null,

		_angle	: 0,

		/**
		 * Overwrite to allow component specific GUI
		 */
		_editableProperties: {rangeX: 5, rangeY: 0, speed: {value: 0, max: 0.2, min: 0}, offset: {value: 0, max: Math.PI, min: -Math.PI}, active: true},

		/**
		 * @inheritDoc
		 */
		attach: function( anEntity ) {
			ChuClone.components.MovingPlatformComponent.superclass.attach.call( this, anEntity );

			this._range = this._range || new Box2D.Common.Math.b2Vec2(5, 0);
			this._offset = this._offset || this._offset;
			this._initialPosition = this.attachedEntity.getBody().GetPosition().Copy();
			this._position = this._initialPosition.Copy();
		},

		/**
		 * Modify the entity to move along axis as defined by sin/cos * range
		 */
		update: function() {
			if( this._range.x !== 0 )
				this._position.x = this._initialPosition.x + Math.cos(this._angle + this._offset) * this._range.x;
			if( this._range.y !== 0 )
				this._position.y = this._initialPosition.y + Math.sin(this._angle + this._offset) * this._range.y;

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
			this._offset = this._editableProperties.offset.value;

			var wasActive = this.requiresUpdate;
			var isActive = this._editableProperties.active;

			// Moving platform was previously unactive - that means it was probably being edited
			// Update the _initialPositionProperty
			if( wasActive != isActive ) {
				if(!isActive) {
					this.attachedEntity.getBody().SetPosition( this._initialPosition.Copy() );
				} else  {
					this._initialPosition = this.attachedEntity.getBody().GetPosition().Copy();
					this._position = this._initialPosition.Copy();
				}
			}
			this.requiresUpdate = isActive;
		},

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.MovingPlatformComponent.superclass.getModel.call(this);
            returnObject.range = {x: this._range.x, y: this._range.y};
            returnObject.speed = this._speed;
            returnObject.offset = this._offset;
            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data ) {
            ChuClone.components.MovingPlatformComponent.superclass.fromModel.call(this, data);
            this._range = new Box2D.Common.Math.b2Vec2( data.range.x, data.range.y );
			this._speed = data.speed;
			this._offset = data.offset;

			this._editableProperties.rangeX = this._range.x;
			this._editableProperties.rangeY = this._range.y;
			this._editableProperties.speed.value = this._speed;
			this._editableProperties.offset.value = this._offset || 0;
        }

	};

    ChuClone.extend( ChuClone.components.MovingPlatformComponent, ChuClone.components.BaseComponent );
})();