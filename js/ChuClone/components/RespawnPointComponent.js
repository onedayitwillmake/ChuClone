/**
File:
	CameraFollowEditorComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	Allows a player to respawn at this point in the level.
    A lot of the ideas here are taken from the Unity ThirdPersonPlatformer tutorial

 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";
	ChuClone.namespace("ChuClone.components");

	// TRACK RESPAWN POINTS INTERNALLY
	/**
	 * @type {Array}
	 */
	var __respawnPoints = [];
	/**
	 * @type {ChuClone.components.RespawnComponent}
	 */
	var __currentRespawnPoint = null;
	/**
	 *  Removes a respawnpoint
	 *  @param {ChuClone.components.RespawnComponent}
	 */
	var __removeRespawnPoint = function( aRespawnPoint ) {
		var len = __respawnPoints.length;
		for (var i = 0; i < len; ++i) {
			if (__respawnPoints[i] === aRespawnPoint) {
				__respawnPoints.splice(i, 1);
				return;
			}
		}
	};
	/**
	 * Adds a respawn point to our internal array
	 * @param {ChuClone.components.RespawnComponent} aRespawnPoint
	 */
	var __addRespawnPoint = function( aRespawnPoint ) {
		__respawnPoints.push(aRespawnPoint);
		__respawnPoints.sort( function( a, b ) {
			var posA = a.attachedEntity.getBody().GetPosition().x;
			var posB = b.attachedEntity.getBody().GetPosition().x;

			if(posA < posB) return -1;
			else if (posA > posB) return 1;
			else return 0;
		});
	};


	ChuClone.components.RespawnComponent = function() {
		ChuClone.components.RespawnComponent.superclass.constructor.call(this);

	};

	ChuClone.components.RespawnComponent.prototype = {
		displayName		: "RespawnComponent",					// Unique string name for this Trait
        _textureSource	: "assets/images/game/flooraqua.png",


        _respawnState   : 0,

        EVENTS: {
            CREATED     : "ChuClone.components.RespawnComponent.events.CREATED",
            DESTROYED   : "ChuClone.components.RespawnComponent.events.DESTROYED"
        },

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.RespawnComponent.superclass.attach.call(this, anEntity);
			__addRespawnPoint( this );

            // Intercept collision
            this.intercept(['onCollision']);
            ChuClone.Events.Dispatcher.emit(ChuClone.components.RespawnComponent.prototype.EVENTS.CREATED, this);
		},

		/**
		 * @inheritDoc
		 */
        execute: function() {
            ChuClone.components.RespawnComponent.superclass.execute.call(this);

            var view = this.attachedEntity.getView();
            var body = this.attachedEntity.getBody();

            // Swap materials
            this._previousMaterial = view.materials[0];
            view.materials[0] = new THREE.MeshLambertMaterial( {
                color: 0xFFFFFF, shading: THREE.SmoothShading,
                map : THREE.ImageUtils.loadTexture( this._textureSource )
            });
        },

		/**
		 * @inheritDoc
		 */
        onCollision: function( otherActor ) {
            if( otherActor._type != ChuClone.Constants.ENTITY_TYPES.PLAYER )
                return;

            this.interceptedProperties.onCollision.call(this.attachedEntity, otherActor );
			__currentRespawnPoint = this;
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
			__removeRespawnPoint( this );
            this.attachedEntity.getView().materials[0] = this._previousMaterial;
            ChuClone.Events.Dispatcher.emit(ChuClone.components.RespawnComponent.prototype.EVENTS.DESTROYED, this);
            ChuClone.components.RespawnComponent.superclass.detach.call(this);
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.RespawnComponent.superclass.getModel.call(this);
            returnObject.textureSource = this._textureSource;

            return returnObject;
        },

		/**
		 * @inheritDoc
		 */
		fromModel: function( data ) {
			ChuClone.components.RespawnComponent.superclass.fromModel.call(this, data);
            this._textureSource = data.textureSource;
		},


		/**
		 * Returns all respawnpoints (Static function)
		 * @return {Array} An Array of respawn points
		 */
		GET_ALL_RESPAWNPOINTS: function() {
			return __respawnPoints;
		},

		GET_CURRENT_RESPAWNPOINT: function() {
			console.log( "GET", __currentRespawnPoint );
			if( !__currentRespawnPoint ) {
				console.log("RespawnPointComponent.GET_CURRENT_RESPAWNPOINT - Warning, no current respawn point exist! - returning first");
				return __respawnPoints[0];
			}
			return __currentRespawnPoint;
		}
	};

    ChuClone.extend( ChuClone.components.RespawnComponent, ChuClone.components.BaseComponent );
})();