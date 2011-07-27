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

    var b2Vec2 = Box2D.Common.Math.b2Vec2;

     // TRACK MOVING PLATFORMS POINTS INTERNALLY
	/**
	 * @type {Array}
	 */
	var __MovingPlatforms = [];
	/**
	 * @type {ChuClone.components.RespawnComponent}
	 */
	var __currentMovingPlatform = null;
	/**
	 *  Removes a MovingPlatform
	 *  @param {ChuClone.components.RespawnComponent}
	 */
	var __removeMovingPlatform = function( aMovingPlatform ) {
		var len = __MovingPlatforms.length;
		for (var i = 0; i < len; ++i) {
			if (__MovingPlatforms[i] === aMovingPlatform) {
				__MovingPlatforms.splice(i, 1);
				return;
			}
		}
	};

    /**
	 * Adds a respawn point to our internal array
	 * @param {ChuClone.components.RespawnComponent} aMovingPlatform
	 */
	var __addMovingPlatform = function( aMovingPlatform ) {
		__MovingPlatforms.push(aMovingPlatform);
		__MovingPlatforms.sort( function( a, b ) {
			var posA = a.attachedEntity.getBody().GetPosition().x;
			var posB = b.attachedEntity.getBody().GetPosition().x;

			if(posA < posB) return -1;
			else if (posA > posB) return 1;
			else return 0;
		});
	};

	ChuClone.namespace("ChuClone.components");
	ChuClone.components.MovingPlatformComponent = function() {
		ChuClone.components.MovingPlatformComponent.superclass.constructor.call(this);
        this._direction = new b2Vec2(1, 1);
        this._speed = new b2Vec2(0,0);
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
		 * @type {Box2D.Common.Math.b2Vec2}
		 */
		_speed	: null,

        /**
         * Direction this platform is moving in. Can be -1, or 1
         * @type {Box2D.Common.Math.b2Vec2}
         */
        _direction: null,

        /**
         * No longer used?
         * @type {Number}
         */
		_offset : 0,

		/**0 
		 * @type {Box2D.Common.Math.b2Vec2}
		 */
		_initialPosition	: null,

		/**
		 * Overwrite to allow component specific GUI
		 */
		_editableProperties: {rangeX: {value: 0, min: 0, max: 30}, rangeY: {value: 0, min: 0, max: 30}, speed: {value: 1, min: 0, max: 15}, offset: {value: 0,  min: -Math.PI,  max: Math.PI}, active: true},

		/**
		 * @inheritDoc
		 */
		attach: function( anEntity ) {
			ChuClone.components.MovingPlatformComponent.superclass.attach.call( this, anEntity );

            this._initialPosition = this.attachedEntity.getBody().GetPosition().Copy();
			this._range = this._range || new b2Vec2(this._editableProperties.rangeX.value, this._editableProperties.rangeY.value);
            this.reset();

            // Draw the extents of the platforms movement if in edit mode
            if( ChuClone.model.Constants.IS_EDIT_MODE() ) {
                var that = this;
                this.attachedEntity.getBody().drawCustom = function( b2World ){ that.drawPlatformForEditor( b2World ) };
            }

            __addMovingPlatform( this );
		},

		/**
		 * Modify the entity to move along axis as defined by sin/cos * range
		 */
		update: function() {
            var finalVelocity = this.attachedEntity.getBody().GetLinearVelocity();
            var finalPosition = this.attachedEntity.getBody().GetPosition();

            /**
             * Handle X
             */
            if( this._range.x > 1 ) {
                var distX = finalPosition.x - this._initialPosition.x;
                var absDistX = Math.abs(distX);
                if( absDistX > this._range.x ) {
                    finalPosition.x = this._initialPosition.x+(this._direction.x * this._range.x);
                    this._direction.x *= -1;
                    finalVelocity.x = this._speed.x * this._direction.x;
                    this.attachedEntity.getBody().SetLinearVelocity( finalVelocity );
                }
            }

            /**
             * Handle Y
             */
            if( this._range.y > 1 ) {
                var distY = finalPosition.y - this._initialPosition.y;
                var absDistY = Math.abs(distY);

                if (absDistY > this._range.y) {
                    finalPosition.y = this._initialPosition.y + (this._direction.y * this._range.y);
                    this._direction.y *= -1;
                    finalVelocity.y = this._speed.y * this._direction.y;
                    this.attachedEntity.getBody().SetLinearVelocity(finalVelocity);
                }
            }
		},

        /**
         * Special drawing function while editing that shows the extents of the platforms movements
         * @param {Box2D.Dynamics.b2World}  Reference to b2World instance
         */
        drawPlatformForEditor: function( b2World ) {
            var initialPositionScaled = this._initialPosition;
            var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;
            var drawScale = b2World.m_debugDraw.m_drawScale;


            var rect = initialPositionScaled.Copy();

            /**
             * Determine the rectangle extents
             */
            // 1 - then determine the entity width scale down to box2d scale, and then multiply that by the drawscale
            var extentsHalfWidth = (this.attachedEntity.width / PTM_RATIO + this._range.x) * b2World.m_debugDraw.m_drawScale;
            var extentsHalfHeight = (this.attachedEntity.height / PTM_RATIO + this._range.y) * b2World.m_debugDraw.m_drawScale;

            // 2 - taking the position + debugOffset and multiplying by the scale
            rect.x = (initialPositionScaled.x + b2World.m_debugDraw.offsetX) * b2World.m_debugDraw.m_drawScale;
            rect.y = (initialPositionScaled.y + b2World.m_debugDraw.offsetY) * b2World.m_debugDraw.m_drawScale;
            // 3 - Because box2d is center based, move the rectangle -extentsWidth (which is half the width of the rect)
            rect.x -= extentsHalfWidth;
            rect.y -= extentsHalfHeight;
            // 4 - Define the width/height of the rect
            // extentsHalfWidth multiplied by 2 in draw call below


            // Draw into the debugdraw context
            b2World.m_debugDraw.m_ctx.fillRect( rect.x, rect.y, extentsHalfWidth * 2, extentsHalfHeight * 2 )
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
            __removeMovingPlatform( this );

            // Reset the attached body
            this.attachedEntity.getBody().SetPosition( this._initialPosition.Copy() );
            this.attachedEntity.getBody().drawCustom = null;
            this.attachedEntity.getBody().SetLinearVelocity( new b2Vec2(0, 0) );

            // Clear our properties
			this._initialPosition = null;
            this._range = null;

			ChuClone.components.MovingPlatformComponent.superclass.detach.call(this);
        },

        /**
         * Set the '_editableProperties' object to our values
         */
        setEditableProps: function() {
			this._editableProperties.rangeX.value = this._range.x;
			this._editableProperties.rangeY.value = this._range.y;
			this._editableProperties.speed.value = this._speed.x;
			this._editableProperties.offset.value = this._offset ;
            this._editableProperties.active = this.requiresUpdate;
        },

        /**
		 * @inheritDoc
		 */
		onEditablePropertyWasChanged: function() {

            // Prevent platform from moving left and right 
            if( this._editableProperties.rangeX.value && this._editableProperties.rangeY.value ) {
                ChuClone.utils.displayFlash("Moving platform does not support simultaneous X and Y axis movement.<br>Set one of them to zero", 0);
                this.setEditableProps();
                return;
            }

			this._range.x = this._editableProperties.rangeX.value;
			this._range.y = this._editableProperties.rangeY.value;
			this._speed.x = this._editableProperties.speed.value;
			this._speed.y = this._editableProperties.speed.value;
			this._offset = this._editableProperties.offset.value;

            this.reset();
			this.requiresUpdate = this._editableProperties.active;
		},

        reset: function() {
            var startPosition = this._initialPosition.Copy();

			this.attachedEntity.getBody().SetAwake(true);
            this.attachedEntity.getBody().SetPosition( startPosition );

            var newVelocity = new b2Vec2( 0, 0 );
            newVelocity.x = (this._range.x > 1) ? this._speed.x*this._direction.x : 0;
            newVelocity.y = (this._range.y > 1) ? this._speed.y*this._direction.y : 0;

            this.attachedEntity.getBody().SetLinearVelocity( newVelocity );
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.MovingPlatformComponent.superclass.getModel.call(this);
            returnObject.initialPosition = {x: this._initialPosition.x, y: this._initialPosition.y};
            returnObject.range = {x: this._range.x, y: this._range.y};
            returnObject.offset = {x: this.offset.x, y: this.offset.y};
            returnObject.speed = this._speed.x;
            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data, futureEntity ) {
            ChuClone.components.MovingPlatformComponent.superclass.fromModel.call(this, data);

            this._range = new b2Vec2( data.range.x, data.range.y );
            this._offset = new b2Vec2( data.offset.x, data.offset.y );
			this._speed = new b2Vec2( data.speed, data.speed );
        },

        RESET_ALL_PLATFORMS_EXCEPT: function( exception ) {
            return;
            var len = __MovingPlatforms.length;
            for(var i = 0; i < len; i++) {
                var platform = __MovingPlatforms[i];
                if( platform == exception )
                    continue;

                platform.attachedEntity.getBody().SetPosition( platform._initialPosition.Copy() );
//				platform.attachedEntity.getBody().SetLinearVelocity( new b2Vec2(0, 0) );
            }
        }

	};

    ChuClone.extend( ChuClone.components.MovingPlatformComponent, ChuClone.components.BaseComponent );
})();