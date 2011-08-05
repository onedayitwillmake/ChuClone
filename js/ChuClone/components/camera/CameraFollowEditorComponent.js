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


			var pos = new Box2D.Common.Math.b2Vec2(this._debugDraw.m_ctx.canvas.width/2, this._debugDraw.m_ctx.canvas.height/2);
            pos.Multiply(1.0 / this._debugDraw.GetDrawScale());
			pos.Multiply(PTM_RATIO);

            this.attachedEntity.position.x = this._debugDraw.offsetX * -PTM_RATIO;
			this.attachedEntity.position.x += pos.x;
            this.attachedEntity.position.y = this._debugDraw.offsetY * PTM_RATIO;
			this.attachedEntity.position.y -= pos.y;

            this.attachedEntity.position.z = 10000 * (1.0/this._debugDraw.GetDrawScale());

			this.attachedEntity.target.position = this.attachedEntity.position.clone();
			this.attachedEntity.target.position.z = -1000;
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