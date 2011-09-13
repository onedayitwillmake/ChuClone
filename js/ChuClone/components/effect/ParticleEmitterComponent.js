/**
 File:
    ParticleEmitterComponent.js
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
	ChuClone.components.effect.ParticleEmitterComponent = function() {
		ChuClone.components.effect.ParticleEmitterComponent.superclass.constructor.call(this);
        this._yLimit = 300;
		this.requiresUpdate = true;
	};

	ChuClone.components.effect.ParticleEmitterComponent.prototype = {
        /**
         * @type {String}
         */
		displayName		: "ParticleEmitterComponent",					// Unique string name for this Trait

		/**
		 * Amount of particles created
		 * @type {Number}
		 */
		_count			: 25,

		/**
		 * @type {THREE.Color}
		 */
		_color			: null,

		/**
		 * @type {Number}
		 */
		_sizeMin		: 4,

		/**
		 * @type {Number}
		 */
		_sizeMax		: 12,

		/**
		 * @type {THREE.Mesh}
		 */
		_geometry		: null,

		/**
		 * @type {THREE.ParticleSystem}
		 */
		_system			: null,


		/**
		 * @type {THREE.Object3D}
		 */
		_parent			: null,

        _yLimit         : 500,
        _maxSpeed       : 17,
        _minSpeed       : 4,

        /**
         * @inheritDoc
         */
        attach: function( anEntity ) {
            ChuClone.components.effect.ParticleEmitterComponent.superclass.attach.call(this, anEntity);

			this._parent = this.attachedEntity.getView();
			this._geometry = new THREE.Geometry();
            for( var i = 0; i < this._count; i++) {
                var vector = new THREE.Vector3(
						(Math.random()*this.attachedEntity.getDimensions().width*2) - this.attachedEntity.getDimensions().width,
						Math.random()*this._yLimit,
						(Math.random() * this.attachedEntity.getDimensions().depth*2) - this.attachedEntity.getDimensions().depth);

                var vertex = new THREE.Vertex( vector );
                vertex.speed = ChuClone.utils.randFloat(this._minSpeed, this._maxSpeed);
				vertex.yLimit = ChuClone.utils.randFloat(this._yLimit*0.8, this._yLimit*1.5);
                this._geometry.vertices.push(vertex);
            }

			this._color = new THREE.Color();
			this._color.setHSV(180/360+0.2, 0.8, 0.9);

			var material = new THREE.ParticleBasicMaterial({size: 15 });
			material.color.setRGB(this._color.r, this._color.g, this._color.b);
            material.transparent = true;
            material.opacity = 0.75;

			this._system = new THREE.ParticleSystem(this._geometry, material);
			this._parent.addChild( this._system );
        },

        update: function() {
            //var entity = this.attachedEntity.getView().position.clone();

			for( var i = 0; i < this._count; i++) {
                this._geometry.vertices[i].position.y += this._geometry.vertices[i].speed;
				if(this._geometry.vertices[i].position.y > this._geometry.vertices[i].yLimit) {

                    this._geometry.vertices[i].speed = ChuClone.utils.randFloat(this._minSpeed, this._maxSpeed);
					this._geometry.vertices[i].yLimit = ChuClone.utils.randFloat(this._yLimit*0.8, this._yLimit*1.5);
					this._geometry.vertices[i].position.y = 0;
                }
            }
			this._geometry.__dirtyVertices = true;
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
			this._parent.removeChild( this._system );
			this._parent = null;
			this._geometry = null;
			this._color = null;
			this._system = null;


			ChuClone.components.effect.ParticleEmitterComponent.superclass.detach.call(this);
        },


		 /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.effect.ParticleEmitterComponent.superclass.getModel.call(this);
			 returnObject.count = this._count;
			 returnObject.color = {r: this._color.r,  g: this._color.g, b: this._color.b};

            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data, futureEntity ) {
            ChuClone.components.effect.ParticleEmitterComponent.superclass.fromModel.call(this, data);
            this._count = data.count;
			this._color = new THREE.Color().setRGB( data.color.r, data.color.g, data.color.b );
        },

		///// Accessors
		setColor: function( aColor ) {
			this._system.materials[0].color = new THREE.Color( aColor );
		},

		setVisible: function( aValue ) {
			this._system.visible = aValue;
		}
	};

    ChuClone.extend( ChuClone.components.effect.ParticleEmitterComponent, ChuClone.components.BaseComponent );
})();