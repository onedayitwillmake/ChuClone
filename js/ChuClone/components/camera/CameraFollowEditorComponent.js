/**
File:
	CameraFollowEditorComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	This component will cause the camera to follow a b2DebugDraw's offset

 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";

	ChuClone.namespace("ChuClone.components.camera");
	ChuClone.components.camera.CameraFollowEditorComponent = function() {
		ChuClone.components.camera.CameraFollowEditorComponent.superclass.constructor.call(this);
        this.requiresUpdate = true;
	};

	ChuClone.components.camera.CameraFollowEditorComponent.prototype = {
        /**
         * @type {String}
         */
		displayName						: "CameraFollowEditorComponent",					// Unique string name for this Trait

        /**
         * @type {Box2D.Dynamics.b2DebugDraw}
         */
        _debugDraw                      : null,

        /**
         * @type {THREE.Vector3}
         */
        _offset                         : null,
        
        /**
         * @type {Number}
         */
        _maxSpeed                       : new Box2D.Common.Math.b2Vec2(0.5, 0.5),

        update: function() {
            var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;
            var zero = new THREE.Vector3(this.attachedEntity.position.x - 5, -100,0);
            this.attachedEntity.target.position = zero;

//            this._debugDraw.GetDrawScale()
//            this._debugDraw.GetSprite().canvas.width;

            //console.log(this._debugDraw.GetSprite())
//            console.log(this._debugDraw.GetSprite().canvas.width/2 / this._debugDraw.GetDrawScale(), PTM_RATIO)
            this.attachedEntity.position.x = this._debugDraw.offsetX * -PTM_RATIO;
            this.attachedEntity.position.y = this._debugDraw.offsetY * PTM_RATIO;
        },

        /**
         * @inheritDoc
         */
        detach: function() {
            ChuClone.components.camera.CameraFollowEditorComponent.superclass.detach.call(this);
            this._debugDraw = null;
        },

        /**
         * @param {Box2D.Dynamics.b2DebugDraw} aDebugDraw
         */
        setDebugDraw: function( aDebugDraw ) {
            this._debugDraw = aDebugDraw
        },

        /**
         * @retur {Box2D.Dynamics.b2DebugDraw} aDebugDraw
         */
        getDebugDraw: function() {
            return this._debugDraw;
        }
	};

    ChuClone.extend( ChuClone.components.camera.CameraFollowEditorComponent, ChuClone.components.BaseComponent );
})();