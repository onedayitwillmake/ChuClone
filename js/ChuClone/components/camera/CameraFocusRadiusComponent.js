/**
File:
	CameraFollowEditorComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	This component will cause the camera to move its current position according to the mouse

 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";

	ChuClone.namespace("ChuClone.components.camera");
	ChuClone.components.camera.CameraFocusRadiusComponent = function() {
		ChuClone.components.camera.CameraFocusRadiusComponent.superclass.constructor.call(this);
        this.requiresUpdate = true;
	};

	var t = 0.1;
	var id = 0;
	ChuClone.components.camera.CameraFocusRadiusComponent.prototype = {
        /**
         * @type {String}
         */
		displayName		: "CameraFocusRadiusComponent",					// Unique string name for this Trait

        /**
         * @type {THREE.Vector3}
         */
        _offset			: new THREE.Vector3(0,0,0),

		/**
         * @type {THREE.Vector2}
         */
        _mousePosition: new THREE.Vector2(0, 0),

        /**
         * @type {Number}
         */
        _radius			: 1000,
		_mouseCallback	: null,

		/**
		 * @inheritDoc
		 */
		attach: function( anEntity ) {
			ChuClone.components.camera.CameraFocusRadiusComponent.superclass.attach.call(this, anEntity);

			var that = this;
			this._mouseCallback = function(e){
				that.onDocumentMouseMove(e)
			};

			document.addEventListener( 'mousemove', this._mouseCallback, false );
		},

		/**
		 * @inheritDoc
		 */
        update: function() {
//            this.attachedEntity.position.x += Math.cos( this._mousePosition.x ) * this._radius;
//            this.attachedEntity.position.z += Math.sin( this._mousePosition.x) * this._radius;
        },

		/**
         * Convert to cartesian cordinates
         * @param {MouseEvent} event
         */
        onDocumentMouseMove: function( event ) {
            event.preventDefault();
            this._mousePosition.x = ( event.clientX / ChuClone.DOM_ELEMENT.offsetWidth ) * 2 - 1;
            this._mousePosition.y = - ( event.clientY / ChuClone.DOM_ELEMENT.offsetHeight ) * 2 + 1;
        },

        /**
         * @inheritDoc
   	      */
        detach: function() {
			console.log("DETACH");
            ChuClone.components.camera.CameraFocusRadiusComponent.superclass.detach.call(this);
            document.removeEventListener( 'mousemove', this._mouseCallback, false );
        },

		/**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.JumpPadComponent.superclass.getModel.call(this);
            returnObject.offset = this._offset;
            returnObject.radius = this._radius;

            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data ) {
            ChuClone.components.JumpPadComponent.superclass.fromModel.call(this, data);
            this._offset = new THREE.Vector3(data._offset.x, data._offset.y, data._offset.z );
            this._radius = data.radius;

        },

		/**
		 * Sets the radius of this component
		 * @param {Number} aRadius
		 */
		setRadius: function( aRadius ) {
			this._radius = aRadius;
		}
	};

    ChuClone.extend( ChuClone.components.camera.CameraFocusRadiusComponent, ChuClone.components.BaseComponent );
})();