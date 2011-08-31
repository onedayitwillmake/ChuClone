/**
File:
	PortalComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	A portal component teleports the player to the connected portal while maintaining their velocity

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
    var __portalPoints = [];
    /**
     * @type {ChuClone.components.PortalComponent}
     */
    var __currentPortalPoint = null;
    /**
     *  Removes a PortalPoint
     *  @param {ChuClone.components.PortalComponent}
     */
    var __removePortalPoint = function( aPortalPoint ) {

        if(__currentPortalPoint == aPortalPoint) {
            __currentPortalPoint = null;
        }
    
        var len = __portalPoints.length;
        for (var i = 0; i < len; ++i) {
            if (__portalPoints[i] === aPortalPoint) {
                __portalPoints.splice(i, 1);
                return;
            }
        }
    };

    /**
     * Adds a respawn point to our internal array
     * @param {ChuClone.components.PortalComponent} aPortalPoint
     */
    var __addPortalPoint = function( aPortalPoint ) {

        // Check if the one before this one, and the one passed both don't have mirrors
        // If they don't... Create a relationship between them
        if( __portalPoints[__portalPoints.length-1 ] ) {
            var otherPortal = __portalPoints[__portalPoints.length - 1];
            if( !otherPortal.getMirror() && !aPortalPoint.getMirror() ) {
                __createRelationship( otherPortal, aPortalPoint );
            }
        }
        __portalPoints.push(aPortalPoint);
    };

    /**
     * Creates a relationship between two portals
     * If force is true, destroys any existing relationship
     *
     * @param {ChuClone.components.PortalComponent} portalA
     * @param {ChuClone.components.PortalComponent} portalB
     * @param {Boolean} force
     */
    var __createRelationship = function( portalA, portalB ) {
        if( portalA.getMirror() || portalB.getMirror() ) {
            console.log("Destroying relationship for portalA or portalB!");
        }

        portalA.setMirror( portalB );
        portalB.setMirror( portalA );
    };


	

	ChuClone.components.PortalComponent = function() {
		ChuClone.components.PortalComponent.superclass.constructor.call(this);
        this._isReady = true;
	};

	ChuClone.components.PortalComponent.prototype = {
		displayName		: "PortalComponent",					// Unique string name for this Trait
        _textureSource	: "assets/images/game/flooraqua.png",
        _respawnState   : 0,

        /**
         * @type {ChuClone.components.PortalComponent}
         */
        _mirror         : null,

        /**
         * Portals are always linked.
         * If a portal does not have an 'otherPortal' property - it does nothing on collision
         * @type {ChuClone.components.PortalComponent}
         */
        _otherPortal  : null,

        _inactiveDelay                  : 1000,
        _isReady                        : true,
        _isReadyTimeout                 : null,

        EVENTS: {
            CREATED     : "ChuClone.components.PortalComponent.events.CREATED",
            DESTROYED   : "ChuClone.components.PortalComponent.events.DESTROYED"
        },

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.PortalComponent.superclass.attach.call(this, anEntity);
			__addPortalPoint( this );

			this.attachedEntity.getBody().GetFixtureList().SetSensor( true );
            
            // Intercept collision
            this.intercept(['onCollision', 'setBody']);
            ChuClone.Events.Dispatcher.emit(ChuClone.components.PortalComponent.prototype.EVENTS.CREATED, this);
		},

		/**
		 * Sets the position of another entity relative to this respawn point
		 * @param {ChuClone.GameEntity} spawnedEntity
		 */
		setSpawnedEntityPosition: function( spawnedEntity ) {
			ChuClone.model.AchievementTracker.getInstance().incrimentDeathCount();
			spawnedEntity.getBody().SetPosition(new Box2D.Common.Math.b2Vec2( this.attachedEntity.getBody().GetPosition().x, this.attachedEntity.getBody().GetPosition().y - 1));
		},

		/**
		 * @inheritDoc
		 */
        execute: function() {
            ChuClone.components.PortalComponent.superclass.execute.call(this);

            var view = this.attachedEntity.getView();
            var body = this.attachedEntity.getBody();

            // Swap materials
            this._previousMaterial = view.materials[0];
            view.materials[0] = new THREE.MeshLambertMaterial( {
//						color: 0xFFFFFF,
						opacity: 0.75,
						transparent: true,
						shading: THREE.SmoothShading,
						map : ChuClone.utils.TextureUtils.GET_TEXTURE( ChuClone.model.Constants.SERVER.ASSET_PREFIX + this._textureSource )
            });
        },

		/**
		 * Override oncollision to set this as the current respawn point
		 */
        onCollision: function( otherActor ) {
            if( otherActor._type != ChuClone.model.Constants.ENTITY_TYPES.PLAYER )
                return;
            if( !this.getMirror() ) return;

            this.interceptedProperties.onCollision.call(this.attachedEntity, otherActor );
            if( !this._isReady ) return;


            // Place at mirrors position and flip Y velocity
            var that = this;
            setTimeout( function() {
                otherActor.getBody().SetPosition( that.getMirror().attachedEntity.getBody().GetPosition() );
                var velocity =  otherActor.getBody().GetLinearVelocity();
                otherActor.getBody().SetLinearVelocity( new Box2D.Common.Math.b2Vec2(velocity.x, -velocity.y) );
            }, 1);

            this.getMirror().startWaitingForIsReady();
            this.startWaitingForIsReady();
        },

         /**
         * Once set _isReady is locked for N milliseconds
         */
        startWaitingForIsReady: function() {
            var that = this;
            this._isReady = false;


            clearTimeout( this._isReadyTimeout );
            this._isReadyTimeout = setTimeout( function(){
                that._isReady = true;
            }, this._inactiveDelay );
        },


        /**
         * Override the setBody function of the entity, to turn this entity's b2Body into a 'sensor' type
         * @param aBody
         */
        setBody: function( aBody ) {
            this.interceptedProperties.setBody.call(this.attachedEntity, aBody );
            this.attachedEntity.getBody().GetFixtureList().SetSensor( true );
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
			__removePortalPoint( this );
            this.attachedEntity.getView().materials[0] = this._previousMaterial;
            ChuClone.Events.Dispatcher.emit(ChuClone.components.PortalComponent.prototype.EVENTS.DESTROYED, this);
            ChuClone.components.PortalComponent.superclass.detach.call(this);
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.PortalComponent.superclass.getModel.call(this);
            returnObject.textureSource = this._textureSource;

            return returnObject;
        },

		/**
		 * @inheritDoc
		 */
        fromModel: function( data, futureEntity ) {
			ChuClone.components.PortalComponent.superclass.fromModel.call(this, data);
            this._textureSource = data.textureSource;
		},

        ///// ACCESSORS
        getIsReady: function() { return this._isReady; },
        /**
         * @return {ChuClone.components.PortalComponent}
         */
        getMirror: function() { return this._mirror },

        /**
         * @param {ChuClone.components.PortalComponent} aPortal
         */
        setMirror: function(aPortal) { this._mirror = aPortal; }

	};

    ChuClone.extend( ChuClone.components.PortalComponent, ChuClone.components.BaseComponent );
})();