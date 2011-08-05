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
         * @type {ChuClone.GameEntity}
         */
        _player                      : null,

        /**
         * @type {THREE.Vector3}
         */
        _offset     : null,
        _damping    : 0.25,

        attach: function( anEntity ) {
            ChuClone.components.camera.CameraFollowPlayerComponent.superclass.attach.call(this, anEntity);

//            ChuClone.Events.Dispatcher.addListener(ChuClone.components.CharacterControllerComponent.prototype.EVENTS.CREATED, function( aPlayer ) {
//                that.onPlayerCreated( aPlayer );
//            });
        },

        update: function() {
			// No player to track
			if( !this._player )
				return;

            var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;
            this.attachedEntity.target.position.x -= (this.attachedEntity.target.position.x - (this._player.view.position.x + 700)) * this._damping;
            this.attachedEntity.target.position.y -= (this.attachedEntity.target.position.y - (this._player.view.position.y - 700)) * this._damping;
            this.attachedEntity.target.position.z = this._player.view.position.z;
            this.attachedEntity.position.x = this._player.view.position.x + 400;
            this.attachedEntity.position.y = this._player.view.position.y;
            this.attachedEntity.position.z = 0;
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.camera.CameraFollowPlayerComponent.superclass.getModel.call(this);
            returnObject.damping = this._damping;

            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data ) {
            ChuClone.components.camera.CameraFollowPlayerComponent.superclass.fromModel.call(this, data);
            this._damping = data.damping;

        },

        /**
         * @inheritDoc
         */
        detach: function() {
            ChuClone.components.camera.CameraFollowPlayerComponent.superclass.detach.call(this);
            this._debugDraw = null;
        },

        /**
         * @param {ChuClone.GameEntity} aPlayer
         */
        onPlayerCreated: function( aPlayer ) {
            this.setPlayer( aPlayer );
        },

        /**
         * @param {ChuClone.GameEntity} aPlayer
         */
        onPlayerDestroyed: function( aPlayer ) {
            console.log("PLAYA:", aPlayer)
//            this.setPlayer( aPlayer );
        },

        /**
         * @param {ChuClone.GameEntity} aPlayer
         */
        setPlayer: function( aPlayer ) {
            this._player = aPlayer;
        }


	};

    ChuClone.extend( ChuClone.components.camera.CameraFollowPlayerComponent, ChuClone.components.BaseComponent );
})();