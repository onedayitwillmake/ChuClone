/**
File:
	EnergyCubeComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	An entity that represents an energy orb from portal that is used for switches

 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";

	ChuClone.namespace("ChuClone.components.portal");

	ChuClone.components.portal.EnergyCubeComponent = function() {
		ChuClone.components.portal.EnergyCubeComponent.superclass.constructor.call(this);

		if( ChuClone.model.Constants.IS_EDIT_MODE() ) {
			this.requiresUpdate = true;
		}
	};

	ChuClone.components.portal.EnergyCubeComponent.prototype = {
		displayName			: "EnergyCubeComponent",					// Unique string name for this Trait
		_textureSource		: "assets/images/game/floor.png",

		/**
		 * THREE.Mesh
		 */
		clone						: null,

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.portal.EnergyCubeComponent.superclass.attach.call(this, anEntity);

			var dimensions = this.attachedEntity.getDimensions();
			var geometry = new THREE.CubeGeometry( dimensions.width + 100, dimensions.height + 10, dimensions.depth + 10);
            var mesh = new THREE.Mesh( geometry, [new THREE.MeshLambertMaterial( {
						color: 0xdd00FF,
						opacity: 0.25,
						transparent: true,
						shading: THREE.SmoothShading,
						map : ChuClone.utils.TextureUtils.GET_TEXTURE( ChuClone.model.Constants.SERVER.ASSET_PREFIX + this._textureSource )
            }) ] );

			//mesh.materials[0].opacity = 0.2;

			this.clone = mesh;
			this.clone.geometry.dynamic = true;
			this.attachedEntity.getView().parent.addChild( this.clone );
			//this.attachedEntity.getView().visible = false;
			//this.attachedEntity.getView().materials[0].opacity = 0.1;
			this.intercept(['setDimensions']);
			this.setDimensions( dimensions.width, dimensions.height, dimensions.depth );
		},

		update: function() {
			this.clone.position = this.attachedEntity.getView().position;
		},

         /**
         * @inheritDoc
         */
        execute: function() {
            ChuClone.components.portal.EnergyCubeComponent.superclass.execute.call(this);
		 },

		/**
		 * Sets the dimensions for this view.
		 * Assumes view has cubic geometry
		 * @param {Number} aWidth
		 * @param {Number} aHeight
		 * @param {Number} aDepth
		 */
        setDimensions: function(aWidth, aHeight, aDepth) {
			//ChuClone.GameEntity.prototype.setDimensions.call( this, aWidth + 10, aHeight + 10, aDepth + 10 );
			//this.width = aWidth;
			//this.height = aHeight;
			//this.depth = aDepth;

            // THIS TRICK CURRENTLY ONLY WORKS FOR RECTANGULAR/CUBE ENTITIES
			var delta = 15;
			aWidth += delta;
			aHeight += delta;
			aDepth += delta;

            this.clone.dynamic = true;
            this.clone.geometry.vertices[0].position = new THREE.Vector3( -aWidth, aHeight, -aDepth );
            this.clone.geometry.vertices[1].position = new THREE.Vector3( -aWidth, aHeight, aDepth );
            this.clone.geometry.vertices[2].position = new THREE.Vector3( -aWidth, -aHeight, -aDepth );
            this.clone.geometry.vertices[3].position = new THREE.Vector3( -aWidth, -aHeight, aDepth );
            this.clone.geometry.vertices[4].position = new THREE.Vector3( aWidth, aHeight, aDepth );
            this.clone.geometry.vertices[5].position = new THREE.Vector3( aWidth, aHeight, -aDepth );
            this.clone.geometry.vertices[6].position = new THREE.Vector3( aWidth, -aHeight, aDepth );
            this.clone.geometry.vertices[7].position = new THREE.Vector3( aWidth, -aHeight, -aDepth );
            this.clone.geometry.__dirtyVertices = true;
            this.clone.geometry.computeBoundingBox();

			aWidth -= delta;
			aHeight -= delta;
			aDepth -= delta;

			this.interceptedProperties.setDimensions.call( this.attachedEntity, aWidth, aHeight, aDepth );
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
            this.clone.parent.removeChild( this.clone );
			this.clone = null;
            ChuClone.components.portal.EnergyCubeComponent.superclass.detach.call(this);
        }
	};

	// Steal setDimensions
	//ChuClone.components.portal.EnergyCubeComponent.prototype.setCloneDimensions = ChuClone.GameEntity.prototype.setDimensions;

    ChuClone.extend( ChuClone.components.portal.EnergyCubeComponent, ChuClone.components.BaseComponent );
})();