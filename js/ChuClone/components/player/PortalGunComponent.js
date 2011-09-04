/**
 File:
    PortalGunComponent.js
 Created By:
    Mario Gonzalez
 Project    :
    ChuClone
 Abstract:
 	Controls the shooting of a portal

 Basic Usage:

  License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";
    ChuClone.namespace("ChuClone.components.player");
    
    var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;

	ChuClone.components.player.PortalGunComponent = function() {
		ChuClone.components.player.PortalGunComponent.superclass.constructor.call(this);
		this.requiresUpdate = true;
		this._mousePosition = new THREE.Vector2();
	};

	ChuClone.components.player.PortalGunComponent.prototype = {
        /**
         * @type {String}
         */
		displayName						: "PortalGunComponent",					// Unique string name for this Trait


		/**
		 * @type {Object}
		 */
		_closures			: null,


		/**
		 * @type {THREE.Vector2}
		 */
		_mousePosition		: null,

		/**
		 * @type {Number}
		 */
		_angle				: null,

		/**
		 * @type {THREE.Mesh}
		 */
		_pointer			: null,
        _orangePortal       : null,
        _bluePortal			: false,

        /**
         * Creates a fixture and attaches to the attachedEntity's Box2D body
         */
        attach: function( anEntity ) {
            ChuClone.components.player.PortalGunComponent.superclass.attach.call(this, anEntity);
			this.setupEvents();
        },


		/**
		 * Sets up events and store the closures
		 */
		setupEvents: function() {
			var that = this;
			this._closures = {};
			this._closures['onMouseMove'] = function(e){ that.onMouseMove(e); };

			this.requiresUpdate = true;
            var geometry = new THREE.CubeGeometry( 10, 50, 10 );
            this._pointerHelper = new THREE.Mesh( geometry, [new THREE.MeshLambertMaterial( {
                color: 0xFF0000,
                shading: THREE.SmoothShading,
                map : ChuClone.utils.TextureUtils.GET_TEXTURE( ChuClone.model.Constants.SERVER.ASSET_PREFIX + "assets/images/game/floor.png" )
            })] );

            ChuClone.GameViewController.INSTANCE.addObjectToScene(this._pointerHelper );

			ChuClone.DOM_ELEMENT.addEventListener('mousemove', this._closures.onMouseMove, true);
		},

		/**
		 * Updates the mouse position and angle of the gun
		 * @param e
		 */
		onMouseMove: function(e) {
			if( !e.shiftKey ) return;
			//
			this._mousePosition.x = ( event.layerX / ChuClone.model.Constants.VIEW.DIMENSIONS.width  ) * 2 - 1;
            this._mousePosition.y = - ( event.layerY / ChuClone.model.Constants.VIEW.DIMENSIONS.height ) * 2 + 1;
			this._angle =  Math.atan2(this._mousePosition.y, this._mousePosition.x);
		},

		update: function() {
			//this._pointerHelper.position = this.attachedEntity.getView().position.clone();



			//this._angle = 0;
            var scalar = 150;
            var pointPosition = this.attachedEntity.getView().position.clone();
            pointPosition.x += Math.cos(this._angle) * scalar;
            pointPosition.y += Math.sin(this._angle) * scalar;
            this._pointerHelper.position = pointPosition;

            //var glide = 0.1;
            this._pointerHelper.rotation.z = this._angle+Math.PI/2;

		},

        /**
         * @inheritDoc
         */
        detach: function() {
            ChuClone.DOM_ELEMENT.addEventListener('mousemove', this._closures.onMouseMove);
			this._closures = null;
            ChuClone.components.player.PortalGunComponent.superclass.detach.call(this);
        }
	};

    ChuClone.extend( ChuClone.components.player.PortalGunComponent, ChuClone.components.BaseComponent );
})();