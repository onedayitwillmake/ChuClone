/**
File:
	CameraFollowPlayerComponent.js
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
	ChuClone.components.camera.CameraFollowPlayerComponent = function() {
		ChuClone.components.camera.CameraFollowPlayerComponent.superclass.constructor.call(this);
        this.requiresUpdate = true;
	};

	ChuClone.components.camera.CameraFollowPlayerComponent.prototype = {
        /**
         * @type {String}
         */
		displayName						: "CameraFollowPlayerComponent",					// Unique string name for this Trait

        /**
         * @type {ChuClone.PlayerEntity}
         */
        _player                      : null,

        /**
         * @type {THREE.Vector3}
         */
        _offset                         : null,
        
        /**
         * @type {Number}
         */
        _maxSpeed                       : new Box2D.Common.Math.b2Vec2(0.5, 0.5),

        attach: function( anEntity ) {
            ChuClone.components.camera.CameraFollowPlayerComponent.superclass.attach.call(this, anEntity);

//            ChuClone.Events.Dispatcher.addListener(ChuClone.PlayerEntity.prototype.EVENTS.CREATED, function( aPlayer ) {
//                that.onPlayerCreated( aPlayer );
//            });
        },

        update: function() {
            var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
            this.attachedEntity.target.position.x = this._player.view.position.x + 700;
            this.attachedEntity.target.position.y = this._player.view.position.y - 100;
            this.attachedEntity.target.position.z = this._player.view.position.z;
            this.attachedEntity.position.x = this._player.view.position.x - 700;
        },

        /**
         * @inheritDoc
         */
        detach: function() {
            ChuClone.components.CameraFollowPlayerComponent.superclass.detach.call(this);
            this._debugDraw = null;
        },

        /**
         * @param {ChuClone.PlayerEntity} aPlayer
         */
        onPlayerCreated: function( aPlayer ) {
            this.setPlayer( aPlayer );
        },

        /**
         * @param {ChuClone.PlayerEntity} aPlayer
         */
        setPlayer: function( aPlayer ) {
            this._player = aPlayer;
        }
	};

    ChuClone.extend( ChuClone.components.camera.CameraFollowPlayerComponent, ChuClone.components.BaseComponent );
})();