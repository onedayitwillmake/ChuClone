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
        __portalPoints.push(aPortalPoint);
        __portalPoints.sort( function( a, b ) {
            var posA = a.attachedEntity.getBody().GetPosition().x;
            var posB = b.attachedEntity.getBody().GetPosition().x;

            if(posA < posB) return -1;
            else if (posA > posB) return 1;
            else return 0;
        });
    };
	

	ChuClone.components.PortalComponent = function() {
		ChuClone.components.PortalComponent.superclass.constructor.call(this);
	};

	ChuClone.components.PortalComponent.prototype = {
		displayName		: "PortalComponent",					// Unique string name for this Trait
        _textureSource	: "assets/images/game/flooraqua.png",
        _respawnState   : 0,
		_previousDimensions : null,

        /**
         * Portals are always linked.
         * If a portal does not have an 'otherPortal' property - it does nothing on collision
         * @type {ChuClone.components.PortalComponent}
         */
        _otherPortal  : null,

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
            // Intercept collision
            this.intercept(['onCollision', 'setBody']);
            ChuClone.Events.Dispatcher.emit(ChuClone.components.PortalComponent.prototype.EVENTS.CREATED, this);
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

			var posA = this.attachedEntity.getBody().GetPosition().Copy()	;
			var posB = otherActor.getBody().GetPosition().Copy();
			var dot = Box2D.Common.Math.b2Math.Dot( posA, posB );
			//debugger;
			console.log("PreDot: " + dot);

			posA.Normalize();
			posB.Normalize();
			dot = Box2D.Common.Math.b2Math.Dot( posA, posB );
			console.log("NormalDot: " + dot);

			//dot.Normalize()

            //this.interceptedProperties.onCollision.call(this.attachedEntity, otherActor );
			//__currentPortalPoint = this;
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


		/**
		 * Returns all PortalPoints (Static function)
		 * @return {Array} An Array of respawn points
		 */
		GET_ALL_PortalPointS: function() {
			return __portalPoints;
		},

		/**
		 * Returns the last touched respawn point, or first if none was set
		 */
		GET_CURRENT_PortalPoint: function() {
			if( !__currentPortalPoint) {
				return __portalPoints[0];
			}
			return __currentPortalPoint;
		}
	};

    ChuClone.extend( ChuClone.components.PortalComponent, ChuClone.components.BaseComponent );
})();