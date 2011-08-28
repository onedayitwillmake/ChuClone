/**
File:
	ChuCloneBaseState.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	An abstract class for the all states specific to ChuClone.
 	Contains update physics and a few properties
 Basic Usage:
 	Should not be instantiated
 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";

	ChuClone.namespace("ChuClone.states");

	ChuClone.states.ChuCloneBaseState = function() {
		ChuClone.states.ChuCloneBaseState.superclass.constructor.call(this);
		this._gameView = null;
		this._worldController = null;
		this._levelManager = null;
	};

	ChuClone.states.ChuCloneBaseState.prototype = {
        /**
         * @type {ChuClone.GameViewController}
         */
        _gameView: null,

        /**
         * @type {ChuClone.physics.WorldController}
         */
        _worldController: null,

		 /**
         * @type {ChuClone.editor.LevelManager}
         */
        _levelManager: null,

		/**
		 * @inheritDoc
		 */
		enter: function() {

			if( !this._levelManager || !this._worldController || !this._gameView ) {
				debugger;
			}

			ChuClone.states.ChuCloneBaseState.superclass.enter.call(this);
            this.setupEvents();
		},

		/**
		 * Sets up events this state wants to listen for
		 */
        setupEvents: function() {
            console.log("setting up events")
        },

        /**
         * @inheritDoc
         */
        update: function() {
            ChuClone.states.ChuCloneBaseState.superclass.update.call(this);
        },

		/**
		 * Updates the physics simulation
		 */
		updatePhysics: function() {
			var fixedTimeStepAccumulatorRatio = this._worldController.getFixedTimestepAccumulatorRatio();

			/**
             * @type {Box2D.Dynamics.b2Body}
             */
            var node = this._worldController.getWorld().GetBodyList();
            while(node) {
                var b = node;
                node = node.GetNext();
                /**
                 * @type {ChuClone.GameEntity}
                 */
                var entity = b.GetUserData();
                if(entity)
                    entity.update( fixedTimeStepAccumulatorRatio );
            }
		},

		/**
		 * Creates a bunch of simple cube entities that can be used as background elements
		 * @param {Number} amount
		 * @param {Boolean} shouldAddToView
		 * @param {Object} Bounds
		 * @param {THREE.Vector3} maxDimensions
		 * @return {Array} backgroundElements An array of THREE.Mesh objects
		 */
		createBackgroundElements: function( amount, shouldAddToView, bounds, maxDimensions) {

			var backgroundElements = [];

			for (var j = 0; j < amount; j++) {
				var width = Math.random() * maxDimensions.x;
				var height = Math.random() * maxDimensions.y;
				var depth = Math.random() * maxDimensions.z;

				var geometry = new THREE.CubeGeometry(width, height, depth);

				var mesh = new THREE.Mesh(geometry, [new THREE.MeshLambertMaterial({
							color: 0xFFFFFF, shading: THREE.SmoothShading,
							map : THREE.ImageUtils.loadTexture(ChuClone.model.Constants.SERVER.ASSET_PREFIX + "assets/images/game/floor.png")
						})]);

				mesh.dynamic = false;
				mesh.position.x = ChuClone.utils.randFloat( bounds.left, bounds.right );
				mesh.position.y = ChuClone.utils.randFloat( bounds.bottom, bounds.top );
				mesh.position.z = ChuClone.utils.randFloat( -1000, -2000);

				backgroundElements.push(mesh);

				if( shouldAddToView ) {
					this._gameView.addObjectToScene(mesh);
				}
			}

			return backgroundElements;
		},

		setupParticles: function( amount, shouldAddToView, bounds, maxDimensions) {

			var base = bounds.right-bounds.left;
			var height = bounds.top-bounds.bottom;
			var area = base*height;
			var ratio = Math.min(area/ChuClone.model.Constants.MAX_LEVEL_AREA, 1);
			var amount = ratio*1000;

			console.log("Creating "+amount+' background particles');

			var backgroundParticleGeometry = new THREE.Geometry();
			var backgroundParticleSprite = new THREE.ImageUtils.loadTexture(ChuClone.model.Constants.SERVER.ASSET_PREFIX + "assets/images/game/particle.png");
			var backgroundParticleColors = [];

			for ( var i = 0; i < amount; i++ ) {

					var x = ChuClone.utils.randFloat( bounds.left, bounds.right );
					var y = ChuClone.utils.randFloat( bounds.bottom, bounds.top );
					var z = ChuClone.utils.randFloat( -3000, 3000);
					var vector = new THREE.Vector3( x, y, z );
					backgroundParticleGeometry.vertices.push( new THREE.Vertex( vector ) );

					backgroundParticleColors[ i ] = new THREE.Color( 0xffffff );
					backgroundParticleColors [ i ].setHSV( ChuClone.utils.randFloat(0.7, 1), 1.0, 1.0 );
				}

			backgroundParticleGeometry.colors = backgroundParticleColors;

			var material = new THREE.ParticleBasicMaterial( { size: 85, map: backgroundParticleSprite, vertexColors: true } );
			material.transparent = true;

			var particles = new THREE.ParticleSystem( backgroundParticleGeometry, material );
			particles.sortParticles = true;
			particles.updateMatrix();

			this.backgroundParticles = particles;
			this._gameView.addObjectToScene(this.backgroundParticles);
		},

        /**
         * @inheritDoc
         */
        exit: function() {
			if(this.backgroundParticles) {
				this._gameView.removeObjectFromScene( this.backgroundParticles );
				this.backgroundParticles = null;
				console.log("Removed particles");
			}

            ChuClone.states.ChuCloneBaseState.superclass.exit.call(this);
            this.dealloc();
        },

		/**
		 * Removes an entity from the game
		 * @param entity
		 */
		remoteEntity: function( entity ) {
			var b = entity.getBody();

			if ("getView" in entity) {
				this._gameView.removeObjectFromScene(entity.getView());
			}

			if ("dealloc" in entity) {
				entity.dealloc();
			}

			this._worldController.getWorld().DestroyBody(b);
		},

        /**
         * @inheritDoc
         */
        dealloc: function() {
			//this._gameView = null;
			//this._worldController = null;
			//this._levelManager = null;
        }
	};

    ChuClone.extend( ChuClone.states.ChuCloneBaseState, ChuClone.model.FSM.State );
})();