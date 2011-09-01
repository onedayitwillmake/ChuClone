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
        this._angle = 0;
	};

	ChuClone.components.PortalComponent.prototype = {
		displayName		: "PortalComponent",					// Unique string name for this Trait

        /**
         * @type {String}
         */
        _textureSource	: "assets/images/game/flooraqua.png",

        /**
         * @type {Object}
         */
		_previousDimensions : null,

        /**
         * Portals are always linked.
         * If a portal does not have an 'otherPortal' property - it does nothing on collision
         * @type {ChuClone.components.PortalComponent}
         */
        _mirror         : null,

        /**
         * @type {Number}
         */
        _mirrorId       : 0,

        /**
         * @type {Number}
         */
        _angle          : 0,

        /**
         * @type {THREE.Mesh}
         */
        _pointerHelper  : null,

        /**
         * @type {ChuClone.components.effect.ParticleEmitterComponent}
         */
        _particleController : null,

        /**
         * If false, collision is ignroed.
         * This happens if there is technically another collision, say the frame after we did our stuff
         * @type {Boolean}
         */
        _isReady                        : true,

        /**
         * How long to wait before being considered ready again
         * @type {Number}
         */
        _inactiveDelay                  : 100,

        /**
         * Store the timeout
         * @type {Number}
         */
        _isReadyTimeout                 : null,

         /**
		 * Overwrite to allow component specific GUI
		 */
		_editableProperties: {angle: {value: 90, min: 0, max: 360, step: 10}},

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
			this._previousDimensions = this.attachedEntity.getDimensions();
			this.attachedEntity.setDimensions( this._previousDimensions.width, ChuClone.model.Constants.PTM_RATIO/4, this._previousDimensions.depth );

            // Particle component
            this._particleController = new ChuClone.components.effect.ParticleEmitterComponent();
            this.attachedEntity.addComponentAndExecute( this._particleController );

            // Intercept collision
            this.intercept(['onCollision', 'setBody']);

            if(ChuClone.model.Constants.IS_EDIT_MODE) {
                this.setupDebug();
            }
		},

        /**
         * Creates a cube that we re-orientate to show us the direction we're traveling in
         */
        setupDebug: function() {
            return;
            this.requiresUpdate = true;
            var geometry = new THREE.CubeGeometry( 25, 100, 25 );
            this._pointerHelper = new THREE.Mesh( geometry, [new THREE.MeshLambertMaterial( {
                color: 0xFFFFFF,
                shading: THREE.SmoothShading,
                map : ChuClone.utils.TextureUtils.GET_TEXTURE( ChuClone.model.Constants.SERVER.ASSET_PREFIX + "assets/images/game/floor.png" )
            })] );

            ChuClone.GameViewController.INSTANCE.addObjectToScene(this._pointerHelper );
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
						opacity: 0.75,
						transparent: true,
						shading: THREE.SmoothShading,
						map : ChuClone.utils.TextureUtils.GET_TEXTURE( ChuClone.model.Constants.SERVER.ASSET_PREFIX + this._textureSource )
            });
        },

        /**
         * Debug update, orientate our debugpoint to show us where we're facing
         */
        update: function() {
            var direction = this.getDirection();

            this._pointerHelper.position = this.attachedEntity.getView().position.clone();

            var scalar = 100;
            var pointPosition = this.attachedEntity.getView().position.clone();
            pointPosition.x += direction.x * scalar;
            pointPosition.y += direction.y * scalar;
            this._pointerHelper.position = pointPosition;

            var newRotation = this.attachedEntity.getView().rotation.clone();
            var glide = 0.1;
            this._pointerHelper.rotation.x -= (this._pointerHelper.rotation.x - newRotation.x) * glide;
            this._pointerHelper.rotation.y -= (this._pointerHelper.rotation.y - newRotation.y) * glide;
            this._pointerHelper.rotation.z -= (this._pointerHelper.rotation.z - newRotation.z) * glide;
        },

		/**
		 * Override oncollision to set this as the current respawn point
		 */
        onCollision: function( otherActor ) {

            // Other actor is not a player, or we don't have a mirror - nothing to do!
            if( otherActor._type != ChuClone.model.Constants.ENTITY_TYPES.PLAYER || !this.getMirror() )
                return;

            // Not ready or mirror is not ready!
            if( !this._isReady || !this.getMirror().getIsReady() ) {
                //console.log("NotReady!");
                return;
            }


            var playerPosition = otherActor.getBody().GetPosition().Copy();


			// Check if the portal and player are facing opposite directions using the dot product
			//var direction = this.getDirection();
			var angleInRadians = (this._angle * Math.PI/180) + Math.PI/2;// +90 degrees in radians
            var normalizedPosition = this.attachedEntity.getBody().GetPosition().Copy();
            normalizedPosition.Normalize();
            normalizedPosition.x = Math.cos( angleInRadians );
            normalizedPosition.y = Math.sin( angleInRadians );
			var direction = normalizedPosition;

            console.log("Direction:", direction, this.getDirection() );
            return;
			var playerToPortal = new Box2D.Common.Math.b2Vec2(playerPosition.x - this.attachedEntity.getBody().GetPosition().x, playerPosition.y - this.attachedEntity.getBody().GetPosition().y);
			playerToPortal.Normalize();

            var dot =  Box2D.Common.Math.b2Math.Dot( direction, playerToPortal );
            if( dot > 0 ) return;
            
			//console.log("Dot:", dot, "Direction:", Math.round(direction.x*100)/100, Math.round(direction.y*100)/100, "PlayerToPortal:", Math.round(playerToPortal.x*100)/100, Math.round(playerToPortal.y*100)/100);


            this.interceptedProperties.onCollision.call(this.attachedEntity, otherActor );

			// Get the players direction, velocity and speed
			var playerVelocity = otherActor.getBody().GetLinearVelocity().Copy();
            var playerSpeed = Math.abs(playerVelocity.x + playerVelocity.y);
            var playerDirection = playerPosition.Copy();
            playerDirection.Add( playerVelocity );
            playerDirection.Subtract( playerPosition );
            playerDirection.Normalize();





            //var angle = Math.atan2(direction.y, direction.x);
            //var playerAngle = Math.atan2( playerDirection.y, playerDirection.x );
            //playerAngle = Math.atan2(Math.sin(playerAngle), Math.cos(playerAngle));

            //console.log(Math.round(angle*180/Math.PI), Math.round(playerAngle*180/Math.PI), "delta:", Math.round((playerAngle-angle)*180/Math.PI));
            //console.log("PlayerDirection:", Math.round(direction.x*100)/100, Math.round(direction.y*100)/100)
            //console.log( "DOT:", Box2D.Common.Math.b2Math.Dot(playerToPortal, direction) );
            this.onPlayerEnterPortal( otherActor, playerDirection, playerSpeed );
        },

        /**
         * Called by us when a player has successfully entered this portal.
         * @param {ChuClone.GameEntity} playerActor
         * @param {Box2D.Common.Math.b2Vec2} playerDirection Direction of the players movement
         * @param {Number} playerSpeed Combined linear velocity of the player
         */
        onPlayerEnterPortal: function( playerActor, playerDirection, playerSpeed ) {
            var that = this;


            // Stop checking the X/Y velocity until this player hits something
            playerActor.addComponentAndExecute( new ChuClone.components.AntiPhysicsVelocityLimitComponent() );
            
            // We have to do it 'next frame' because box2d locks all these properties during a collision
            setTimeout( function() { that.getMirror().onPlayerExitPortal( playerActor, playerDirection, playerSpeed ); }, 1);

            this.startWaitingForIsReady();
        },

        /**
         * Called by us when a player has successfully entered this portal.
         * @param {ChuClone.GameEntity} playerActor
         * @param {Box2D.Common.Math.b2Vec2} playerDirection Direction of the players movement
         * @param {Number} playerSpeed Combined linear velocity of the player
         */
        onPlayerExitPortal: function( playerActor, playerDirection, playerSpeed ) {

            this.startWaitingForIsReady();
            playerActor.getBody().SetPosition( this.attachedEntity.getBody().GetPosition().Copy() );


            // Rotate the players velocity
            var directionVector = this.getDirection();
            directionVector.Multiply( playerSpeed );
            directionVector.y *= -1; // Flip Y for box2d
            playerActor.getBody().SetLinearVelocity( directionVector );
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

            if( this._pointerHelper ) {
                this._pointerHelper.parent.removeChild( this._pointerHelper );
                this._pointerHelper = null;
            }


            var aParticleEmitterComponent = this.attachedEntity.getComponentByName(ChuClone.components.effect.ParticleEmitterComponent.prototype.displayName);
            if( aParticleEmitterComponent == this._particleController ) {
                this.attachedEntity.removeComponentWithName( ChuClone.components.effect.ParticleEmitterComponent.prototype.displayName );
                this._particleController = null;
            }

            ChuClone.components.PortalComponent.superclass.detach.call(this);
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.PortalComponent.superclass.getModel.call(this);
            returnObject.textureSource = this._textureSource;
            returnObject.mirrorId = this._mirrorId;
            returnObject.angle = this._angle;

            return returnObject;
        },

		/**
		 * @inheritDoc
		 */
        fromModel: function( data, futureEntity ) {
			ChuClone.components.PortalComponent.superclass.fromModel.call(this, data);
            this._textureSource = data.textureSource;
            this._mirrorId  = data._mirrorId || 0;
            this._angle = data.angle || 0;
		},

        ///// EDITABLE PROPERTIES
        /**
         * Set the '_editableProperties' object to our values
         */
        setEditableProps: function() {
			this._editableProperties.angle.value = this._angle;
        },

        /**
		 * Modify the texture to face left or right
		 */
		onEditablePropertyWasChanged: function() {
            this._angle = this._editableProperties.angle.value;

            //console.log( this.getDirection().x, this.getDirection().y );
            this.attachedEntity.getBody().SetAngle( this._angle * Math.PI/180 );
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
        setMirror: function(aPortal) { this._mirror = aPortal; },

        /**
         * @return {Box2D.Common.Math.b2Vec2} direction
         */
        getDirection: function() {
            var angleInRadians = (this._angle * Math.PI/180) + Math.PI/2; // +90 degrees in radians
            
            var normalizedPosition = this.attachedEntity.getBody().GetPosition().Copy();
            normalizedPosition.Normalize();
            normalizedPosition.x = -(Math.cos( angleInRadians ));
            normalizedPosition.y = Math.sin( angleInRadians );
            return normalizedPosition;
        }
	};

    ChuClone.extend( ChuClone.components.PortalComponent, ChuClone.components.BaseComponent );
})();