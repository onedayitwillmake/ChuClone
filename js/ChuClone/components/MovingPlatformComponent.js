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
		_speed	: 3,
        _direction: 1,
		_offset : 0,

		/**0 
		 * @type {Box2D.Common.Math.b2Vec2}
		 */
		_initialPosition	: null,

		_angle	: 0,

		/**
		 * Overwrite to allow component specific GUI
		 */
		_editableProperties: {rangeX: {value: 0, max: 0.1, min: 30}, rangeY: {value: 0, max: 0.1, min: 30}, speed: {value: 0, max: 0.2, min: 0}, offset: {value: 0, max: Math.PI, min: -Math.PI}, active: true},

		/**
		 * @inheritDoc
		 */
		attach: function( anEntity ) {
			ChuClone.components.MovingPlatformComponent.superclass.attach.call( this, anEntity );

            this._angle = 0;
			this._range = this._range || new b2Vec2(this._editableProperties.rangeX, this._editableProperties.rangeY);
			this._offset = this._offset || this._offset;


			this._initialPosition = this.attachedEntity.getBody().GetPosition().Copy();
			this.attachedEntity.getBody().SetAwake(true);
            this.attachedEntity.getBody().SetLinearVelocity( new b2Vec2(this._speed, 0) );

            /**
             *
             * @param {Box2D.Dynamics.b2World} b2World
             */
            var b = this.attachedEntity.getBody();
            var that = this;
            var initialPositionScaled = this._initialPosition;
            var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;
            this.attachedEntity.getBody().drawCustom = function(b2World) {
                var s = b2World.m_debugDraw.m_ctx;
                var drawScale = b2World.m_debugDraw.m_drawScale;
                var rect = initialPositionScaled.Copy();

                /**
                 * Determine the rectangle extents
                 */
                // 1 - then determine the entity width scale down to box2d scale, and then multiply that by the drawscale
                var extentsHalfWidth = (that.attachedEntity.width/PTM_RATIO+that._range.x)*b2World.m_debugDraw.m_drawScale;
                var extentsHalfHeight = (that.attachedEntity.height/PTM_RATIO+that._range.y)*b2World.m_debugDraw.m_drawScale;

                // 2 - taking the position + debugOffset and mutliplying by the scale
                rect.x = (initialPositionScaled.x + b2World.m_debugDraw.offsetX) * b2World.m_debugDraw.m_drawScale;
                rect.y = (initialPositionScaled.y + b2World.m_debugDraw.offsetY) * b2World.m_debugDraw.m_drawScale;
                // 3 - Because box2d is center based, move the rectangle -extentsWidth (which is half the width of the rect)
                rect.x -= extentsHalfWidth;
                rect.y -= extentsHalfHeight;
                // 4 - Define the width/height of the rect
                rect.width = extentsHalfWidth*2;
                rect.height = extentsHalfHeight*2;


                s.fillRect( rect.x, rect.y, rect.width, rect.height )
            }

            __addMovingPlatform( this );
		},

		/**
		 * Modify the entity to move along axis as defined by sin/cos * range
		 */
		update: function() {

            var bodyPosition = this.attachedEntity.getBody().GetPosition();
            var dist = bodyPosition.x - this._initialPosition.x;//- (this._initialPosition.x + this._range.x)
            var absDist = Math.abs(dist);
            var rate = Math.abs( (dist / this._range.x) );

//            rate = Math.max(rate, 0.5)
//            this.attachedEntity.getBody().SetLinearVelocity( new b2Vec2(rate * this._speed * this._direction, 0) );


            if( absDist > this._range.x ) {
                this.attachedEntity.getBody().SetPosition( new b2Vec2(this._initialPosition.x+(this._direction*this._range.x), this._initialPosition.y) );
                this._direction *= -1;
                this.attachedEntity.getBody().SetLinearVelocity( new b2Vec2(this._speed * this._direction, 0) );

            }


//            if( bodyPosition.x > this._initialPosition.x + this._range.x ) {
//                this.attachedEntity.getBody().SetLinearVelocity( this._speed * this._direction)
//            }
//            var angle = Date.now() * 0.001;


//            var velocity = new b2Vec2(0, 0);
//			if( this._range.x !== 0 )
//				velocity.x = Math.cos(angle + this._offset) * this._range.x;
//			if( this._range.y !== 0 )
//				velocity.y = Math.sin(angle + this._offset) * this._range.y;

//            this.attachedEntity.getBody().SetLinearVelocity( velocity );
//			this._angle += this._speed;
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
            __removeMovingPlatform( this );
			this.attachedEntity.getBody().SetPosition( this._initialPosition.Copy() );
            this.attachedEntity.getBody().drawCustom = null;
            this.attachedEntity.getBody().SetLinearVelocity( new b2Vec2(0, 0) );

			this._initialPosition = null;
			ChuClone.components.MovingPlatformComponent.superclass.detach.call(this);
        },

		/**
		 * @inheritDoc
		 */
		onEditablePropertyWasChanged: function() {



			this._range.x = this._editableProperties.rangeX.value;
			this._range.y = this._editableProperties.rangeY.value;
			this._speed = this._editableProperties.speed.value;
			this._offset = this._editableProperties.offset.value;

			var wasActive = this.requiresUpdate;
			var isActive = this._editableProperties.active;

            return;
//			// Reset the body
//			if( this._speed != previousSpeed || this._offset != previousOffset ) {
//				this.attachedEntity.getBody().SetPosition( this._initialPosition.Copy() );
////				this.attachedEntity.getBody().SetLinearVelocity( new b2Vec2(0, 0) );
//			};
//			// Moving platform was previously unactive - that means it was probably being edited
//			if( wasActive != isActive ) {
//				if(!isActive) { // Platform has been turned off
////                    this.attachedEntity.getBody().SetLinearVelocity( new b2Vec2(0, 0) );
//				} else  { // Platform has been turned on
//					this._initialPosition = this.attachedEntity.getBody().GetPosition().Copy();;
//				}
//			}

//            this.reset();
			this.requiresUpdate = isActive;
		},

        reset: function() {
            //this.attachedEntity.getBody().SetAwake(true);
//            this._angle = 0
            this.attachedEntity.getBody().SetPosition( this._initialPosition.Copy() );
            this.attachedEntity.getBody().SetLinearVelocity( new b2Vec2(0,0))
        },

        /**
         * Set the '_editableProperties' object to our values
         */
        setEditableProps: function() {
			this._editableProperties.rangeX.value = this._range.x;
			this._editableProperties.rangeY.value = this._range.y;
			this._editableProperties.speed.value = this._speed;
			this._editableProperties.offset.value = this._offset ;
            this._editableProperties.active = this.requiresUpdate;
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.MovingPlatformComponent.superclass.getModel.call(this);
            returnObject.initialPosition = {x: this._initialPosition.x, y: this._initialPosition.y};
            returnObject.range = {x: this._range.x, y: this._range.y};
            returnObject.speed = this._speed;
            returnObject.offset = this._offset;
            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data, futureEntity ) {
            ChuClone.components.MovingPlatformComponent.superclass.fromModel.call(this, data);

            this._range = new b2Vec2( data.range.x, data.range.y );
			this._speed = data.speed;
			this._offset = data.offset;
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
                platform._angle = 0;
            }
        }

	};

    ChuClone.extend( ChuClone.components.MovingPlatformComponent, ChuClone.components.BaseComponent );
})();