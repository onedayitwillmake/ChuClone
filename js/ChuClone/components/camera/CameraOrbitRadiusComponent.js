/**
File:
	CameraOrbitRadiusComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	This camera orbits it's target position. It is used in the endlevelstate

 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";

	ChuClone.namespace("ChuClone.components.camera");
	ChuClone.components.camera.CameraOrbitRadiusComponent = function() {
		ChuClone.components.camera.CameraOrbitRadiusComponent.superclass.constructor.call(this);
        this.requiresUpdate = true;
	};

	ChuClone.components.camera.CameraOrbitRadiusComponent.prototype = {
        /**
         * @type {String}
         */
		displayName		: "CameraOrbitRadiusComponent",					// Unique string name for this Trait

        /**
         * @type {THREE.Vector3}
         */
        _offset			: new THREE.Vector3(0,0,0),

		/**
         * @type {THREE.Vector3}
         */
		_target			: null,

		/**
         * @type {THREE.Vector3}
         */
		_rotationSpeed	: new THREE.Vector3(0.003, 0.005, 0.003),

		/**
         * @type {THREE.Vector2}
         */
        _mousePosition: new THREE.Vector2(3.05, 1),

        /**
         * @type {THREE.Vector3}
         */
        _radius			: new THREE.Vector3(0, 0, 0),

		/**
		 * @type {Function}
		 */
		_mouseCallback	: null,


		/**
		 * @inheritDoc
		 */
		attach: function( anEntity ) {
			ChuClone.components.camera.CameraOrbitRadiusComponent.superclass.attach.call(this, anEntity);

			var that = this;
			this._mouseCallback = function(e){
				that.onDocumentMouseMove(e)
			};

			document.addEventListener( 'mousemove', this._mouseCallback, false );
		},

		/**
		 * Move the camera around it's current 'position'
		 */
        update: function() {

			var damping = 0.04;

			var newX = this._target.x + (Math.cos( this._offset.x ) * this._radius.x);
			var newY = this._target.y + (this._mousePosition.y*2-1) * this._radius.y + 500 + Math.sin(this._offset.y) * this._radius.y;
			var newZ = this._target.z + (Math.sin( this._offset.z ) * this._radius.z);
            this.attachedEntity.position.x -= (this.attachedEntity.position.x - newX) * damping;
            this.attachedEntity.position.y -= (this.attachedEntity.position.y - newY) * damping;
            this.attachedEntity.position.z -= (this.attachedEntity.position.z - newZ) * damping;

			//this.attachedEntity.target.position.x = this.attachedEntity.position.x;
			//this.attachedEntity.target.position.y = this.attachedEntity.position.y - 500;
			//this.attachedEntity.target.position.z = this.attachedEntity.position.z;
			//this.attachedEntity.target.position.y -= 500;
			this._offset.addSelf( this._rotationSpeed );
        },

		/**
         * Convert to cartesian cordinates
         * @param {MouseEvent} event
         */
        onDocumentMouseMove: function( event ) {
            event.preventDefault();
            this._mousePosition.x = event.clientX / ChuClone.DOM_ELEMENT.offsetWidth;
            this._mousePosition.y = (event.clientY / ChuClone.DOM_ELEMENT.offsetHeight);
        },

        /**
         * @inheritDoc
   	      */
        detach: function() {
            ChuClone.components.camera.CameraOrbitRadiusComponent.superclass.detach.call(this);
            document.removeEventListener( 'mousemove', this._mouseCallback, false );
        },

		/**
		 * Sets the radius of this component
		 * @param {THREE.Vector3} aRadius
		 */
		setRadius: function( aRadius ) {
			this._radius = aRadius;
		},

		/**
		 * @return {THREE.Vector3}
		 */
		getRadius: function() { return this._radius; },

		/**
		 * @type {THREE.Vector3}
		 */
		setTarget: function(aTarget) { this._target = aTarget; }
	};

    ChuClone.extend( ChuClone.components.camera.CameraOrbitRadiusComponent, ChuClone.components.BaseComponent );
})();