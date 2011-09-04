/**
 File:
    MotionStreakComponent.js
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
    
	ChuClone.namespace("ChuClone.components.effect");
	ChuClone.components.effect.MotionStreakComponent = function() {
		ChuClone.components.effect.MotionStreakComponent.superclass.constructor.call(this);
		this._closures = {};
		this._prev = new THREE.Vector3(0,0,0);
	};

	ChuClone.components.effect.MotionStreakComponent.prototype = {
        /**
         * @type {String}
         */
		displayName		: "MotionStreakComponent",					// Unique string name for this Trait

		/**
         * @type {String}
         */
        _textureSource                  : "assets/images/game/motionstreak.png",

        /**
         * @inheritDoc
         */
        canStack        : false,
        
        /**
         * @inheritDoc
         */
        requiresUpdate  : true,

		/**
		 * @type {Number}
		 */
		_color			: 0xFFFFFF,

        /**
         * @type {THREE.Geometry}
         */
        _geometry        : null,

		/**
         * @type {THREE.Mesh}
         */
        _mesh        : null,

		/**
         * @type {THREE.Mesh}
         */
        _texture        : null,

		/**
		 * Store reference to parent,
		 * @type {THREE.Object3D}
		 */
		_parent			: null,

		/**
		 * Store callbacks in here
		 * @type {Object}
		 */
		_closures		: null,
        
        /**
         * @inheritDoc
         */
        attach: function( anEntity ) {
            ChuClone.components.effect.MotionStreakComponent.superclass.attach.call(this, anEntity);
            this._parent = this.attachedEntity.getView().parent;

			this._geometry = new THREE.PlaneGeometry(100, 100, 1, 25);
			this._geometry.dynamic = true;

			this._texture = THREE.ImageUtils.loadTexture( ChuClone.model.Constants.SERVER.ASSET_PREFIX + ChuClone.components.effect.MotionStreakComponent.prototype._textureSource);
			this._mesh = new THREE.Mesh(this._geometry, [new THREE.MeshBasicMaterial({
						color: this._color,
						shading: THREE.SmoothShading,
						transparent: true,
						opacity: 0.75,
						//blending: THREE.Mult,
						map: this._texture
					})]);

			this._mesh.doubleSided = true;
			this._mesh.position.set(0, 0,0);
			this._parent.addChild( this._mesh );

			this.setupEvents();
			this.resetStreak();
        },

		setupEvents: function() {
			var that = this;
			var spawnedPlayerEventString = ChuClone.components.RespawnComponent.prototype.EVENTS.SPAWNED_PLAYER;
			this._closures[spawnedPlayerEventString] = function( respawnComponent ) {
				that.resetStreak( respawnComponent );
			};

			ChuClone.Events.Dispatcher.addListener(spawnedPlayerEventString, this._closures[spawnedPlayerEventString])
		},

		angle:0,
        update: function() {

			var vector = this.attachedEntity.getView().position.clone();
			vector.x -= this.attachedEntity.getView().boundRadius*0.5;
			vector.y -= this.attachedEntity.getView().boundRadius*0.5;


			var result = vector.clone();
			result.normalize();

			// Rotate Y
			this.angle += 0.2;
			var sina = Math.sin(this.angle);
			var cosa = Math.cos(this.angle);
			var ry = result.y * cosa - result.z * sina;
			var rz = result.y * sina + result.z * cosa;
			result.y = ry;
			result.z = rz;


			var left = result.clone();
			left.multiplyScalar(55);
			left.addSelf( vector.clone() );

			var right = result.clone();
			right.multiplyScalar(-55);
			right.addSelf( vector.clone() );


			var randomShift = 10;
			var halfRandomShift = randomShift/2;
			var range = 20;
			var len = this._geometry.vertices.length;
			for( var i = 0; i < len; i+=2) {
				if( i === 0 ) {
					//var vectorA = vector.clone();
					right.y -= range;
					//left.z -= range;
					this._geometry.vertices[i].position = left;

					//var vectorB = vector.clone();
					left.y += range;
					//right.z += range;
					this._geometry.vertices[i+1].position = right;


					continue;
				}

				var s = i;
				for( var n = i; n < i+2; n++ ) {
					var prev = n-2;
					var glide = 0.4;

					//this._geometry.vertices[n].position = this._geometry.vertices[prev].position.clone();
					var deltaX = (this._geometry.vertices[n].position.x - this._geometry.vertices[prev].position.x);
					var deltaY = (this._geometry.vertices[n].position.y - this._geometry.vertices[prev].position.y);
					var deltaZ = (this._geometry.vertices[n].position.z - this._geometry.vertices[prev].position.z);

					this._geometry.vertices[n].position.x -= deltaX * glide;
					this._geometry.vertices[n].position.y -= deltaY * glide;
					this._geometry.vertices[n].position.z -= deltaZ * glide;
					this._geometry.vertices[n].position.x += Math.random()*deltaX/8-(deltaX/16);
					this._geometry.vertices[n].position.y += Math.random()*deltaY/4-(deltaY/8);
					this._geometry.vertices[n].position.z += Math.random()*deltaY/4-(deltaY/8);
				}
			}


			this._geometry.__dirtyVertices = true;
        },

		resetStreak: function( respawnPoint ) {
			var positionSource = respawnPoint || this;
			var vector = positionSource.attachedEntity.getView().position.clone();

			var len = this._geometry.vertices.length;
			for( var i = 0; i < len; i+=2) {
				this._geometry.vertices[i].position = vector.clone();
				this._geometry.vertices[i+1].position = vector.clone();
			}
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
			ChuClone.Events.Dispatcher.removeListener( ChuClone.components.RespawnComponent.prototype.EVENTS.SPAWNED_PLAYER,
			this._closures[ChuClone.components.RespawnComponent.prototype.EVENTS.SPAWNED_PLAYER]);


			if( this._parent ) {
                this._parent.removeObject( this._mesh );
            }
			this._parent = null;
			this._closures = null;
			this._mesh = null;
			this._geometry = null;
			this._texture = null;
			ChuClone.components.effect.MotionStreakComponent.superclass.detach.call(this);
        }
	};

    ChuClone.extend( ChuClone.components.effect.MotionStreakComponent, ChuClone.components.BaseComponent );
})();