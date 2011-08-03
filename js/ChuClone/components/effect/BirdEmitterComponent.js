/**
 File:
    BirdEmitterComponent.js
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
	ChuClone.components.effect.BirdEmitterComponent = function() {
		ChuClone.components.effect.BirdEmitterComponent.superclass.constructor.call(this);
		this.requiresUpdate = true;
	};

	ChuClone.components.effect.BirdEmitterComponent.prototype = {
        /**
         * @type {String}
         */
		displayName		: "BirdEmitterComponent",					// Unique string name for this Trait
        canStack        : true,

		/**
		 * Amount of particles created
		 * @type {Number}
		 */
		_count			: 80,

		/**
		 * @type {THREE.Color}
		 */
		_color			: null,

		/**
		 * @type {Number}
		 */
		_sizeMin		: 5,

		/**
		 * @type {Number}
		 */
		_sizeMax		: 5,


        /**
         * @type {Array}
         */
        _birds          : null,

		/**
		 * Store reference to parent,
		 * @type {THREE.Object3D}
		 */
		_parent			: null,
        
        /**
         * @inheritDoc
         */
        attach: function( anEntity ) {
            ChuClone.components.effect.BirdEmitterComponent.superclass.attach.call(this, anEntity);

            this._parent = this.attachedEntity.getView().parent;

            this._birds = [];
            var range = 600;

            var start = this.attachedEntity.getView().position.clone();

            for(var i = 0; i < this._count; i++ ) {
                var bird = this._birds[ i ] = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( {
                    color:Math.random() * 0x222222 + 0xDDDDDD
                } ) );
                bird.phase = Math.floor( Math.random() * 62.83 );
                bird.position = new THREE.Vector3( start.x + Math.random() * -range*2, start.y + Math.random() * range, start.z + (Math.random()*2-1) * range*2 );
                bird.speed = 8 + Math.random() * 8;

                bird.doubleSided = true;
                bird.dynamic = true;

                var prop = {target: bird, scale: 0};
                var tween = new TWEEN.Tween(prop)
                    .to({scale: (Math.random()) * this._sizeMax + this._sizeMin}, Math.random() * 9000 + 200)
                    .onUpdate(function() {
                        this.target.scale.x = this.target.scale.y = this.target.scale.z = this.scale;
                    })
                    .easing(TWEEN.Easing.Sinusoidal.EaseInOut)
                    .start();


                bird.scale.x = bird.scale.y = bird.scale.z = 0;
                this._parent.addObject( bird );
            }
        },

        update: function() {
			for ( var i = 0, il = this._birds.length; i < il; i++ ) {
                var bird = this._birds[ i ];
                // Position
                bird.position.x += bird.speed;
                bird.position.y += Math.sin(bird.phase) * 4 + 1;

				if(bird.position.x > this.attachedEntity.getView().position.x + 6000) {
					bird.position.x = this.attachedEntity.getView().position.x - Math.random() * 1000;
					bird.position.y = this.attachedEntity.getView().position.y + Math.random() * 1000;

					var range = 600;
					bird.position.z =  (Math.random()*2-1) * range*2
				}
                //
			    bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.05 )  ) % 62.83;
                bird.geometry.vertices[ 5 ].position.y = bird.geometry.vertices[ 4 ].position.y = Math.sin(bird.phase*3);
                bird.geometry.__dirtyVertices = true;
            }
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
			for ( var i = 0, len = this._birds.length; i < len; i++ ) {
                this._parent.removeObject( this._birds[i] );
            }
            this._birds = null;
			this._parent = null;
			ChuClone.components.effect.BirdEmitterComponent.superclass.detach.call(this);
        }
	};

    ChuClone.extend( ChuClone.components.effect.BirdEmitterComponent, ChuClone.components.BaseComponent );
})();