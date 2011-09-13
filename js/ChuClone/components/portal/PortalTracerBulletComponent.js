/**
File:
	TiltComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	When collision with player, fires a TiltComponent.events.DID_REACH_GOAL event

 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";
	var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var b2BodyDef = Box2D.Dynamics.b2BodyDef;
    var b2Body = Box2D.Dynamics.b2Body;
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
	var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;
	var TO_RADIANS = ChuClone.model.Constants.TO_RADIANS;
	var TO_DEGREES= ChuClone.model.Constants.TO_DEGREES;
	var Y_OFFSET = (1 * PTM_RATIO);

	ChuClone.namespace("ChuClone.components.portal");
	ChuClone.components.portal.PortalTracerBulletComponent = function() {
		ChuClone.components.portal.PortalTracerBulletComponent.superclass.constructor.call(this);
		this._angle = 0;

		if( ChuClone.model.Constants.IS_EDIT_MODE() ) {
			this.requiresUpdate = true;
		}
	};

	ChuClone.components.portal.PortalTracerBulletComponent.prototype = {
		displayName						: "PortalTracerBulletComponent",

		/**
		 * A force we apply every frame to counter the world's gravity so our bullet floats forever
		 * @type {Box2D.Common.Math.b2Vec2}
		 */
		_antiGravity		: null,

		/**
		 * @type {Box2D.Common.Math.b2Vec2}
		 */
		_lastCollisionLocation : null,

		/**
		 * Prevent tracer bullets from being saved in the level data
		 */
		_isSavable			: false,

		/**
         * Restore material and restitution
         */
        attach: function( anEntity) {
            ChuClone.components.portal.PortalTracerBulletComponent.superclass.attach.call(this, anEntity);

			this.attachedEntity.getView().materials[0] = new THREE.MeshLambertMaterial( {
                color: 0xFFFFFF,
                shading: THREE.SmoothShading,
                map : ChuClone.utils.TextureUtils.GET_TEXTURE( ChuClone.model.Constants.SERVER.ASSET_PREFIX + "assets/images/game/floor.png" )
            });

			this.intercept(['_isSavable']);
        },

		/**
		 * @inheritDoc
		 */
		update: function() {
			this._tracer.ApplyForce( this._antiGravity, this._tracer.GetWorldCenter() );
			if( this._lastCollisionLocation ) {
				this._tracer.SetPosition( this._lastCollisionLocation );
			}
		},

		playSound: function( id ) {
			ChuClone.Events.Dispatcher.emit(
					ChuClone.controller.AudioController.prototype.EVENTS.SHOULD_PLAY_SOUND,
					id);
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
			ChuClone.components.portal.PortalTracerBulletComponent.superclass.detach.call(this);
        },

		///// ACCESSORS
		/**
		 * Set the anti-gravity by supplying a force
		 * @param {Number} aGravityForce
		 */
		setAntiGravity: function( aGravityForce ) {
			//this._worldController.getWorld().GetGravity().y
			this._antiGravity = new b2Vec2(0, this.body.GetMass() * aGravityForce );
		},

		/**
		 * Sets the position and angle of the tracer bullet
		 * @param {Number} x
		 * @param {Number} y
		 */

		fireFrom: function( x, y ) {

			var position = new b2Vec2(x, y);
			this.attachedEntity.getBody().SetPositionAndAngle( position, 0);
			this.attachedEntity.getView().position.x = (x * PTM_RATIO);
			this.attachedEntity.getView().position.y = (y * PTM_RATIO) + Y_OFFSET;

			// Attach a motionstreak component and reset it
            var motionstreak = this.attachedEntity.getComponentWithName( ChuClone.components.effect.MotionStreakComponent.prototype.displayName );
			if( !motionstreak ) {
				motionstreak = this._tracerEntity.addComponentAndExecute( new ChuClone.components.effect.MotionStreakComponent() );
			}
			motionstreak.resetStreak();

			// Play firing sound
			this.playSound( ChuClone.model.Constants.SOUNDS.PORTAL_SHOOT.id );
		},

		/**
		 * Sets the position and angle of the attachedEntities body
		 * @param position
		 */
		SetPositionAndAngle: function( position ) {
			this.attachedEntity.getBody().SetPositionAndAngle( position, 0);
		},

		/**
		 * Removes the motionstreak created when firing
		 */
		removeMotionStreak: function() {
			this.attachedEntity.removeComponentWithName( ChuClone.components.effect.MotionStreakComponent.prototype.displayName );
		},

		setLastCollisionLocation: function( position ) {

		},
	};

    ChuClone.extend( ChuClone.components.portal.PortalTracerBulletComponent, ChuClone.components.BaseComponent );
})();