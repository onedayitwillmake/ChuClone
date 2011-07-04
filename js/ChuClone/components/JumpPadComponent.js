/**
File:
	ChaseTrait.js
Created By:
	Mario Gonzalez
Project	:
	RealtimeMultiplayerNodeJS
Abstract:
 	This trait will cause an entity to chase a target
 Basic Usage:

*/
(function(){
	ChuClone.namespace("ChuClone.components");
	var RATE = 0.2;

	ChuClone.components.JumpPadComponent = function() {
		ChuClone.components.JumpPadComponent.superclass.constructor.call(this);
        console.log(this)
	};

	ChuClone.components.JumpPadComponent.prototype = {
		displayName						: "ChaseTrait",					// Unique string name for this Trait

        _previousMaterial               : null,
        _previousRestitution            : 0,

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.JumpPadComponent.superclass.attach.call(this, anEntity);

            var view = anEntity.getView();
            var body = anEntity.getBody();

            // Swap materials
            this._previousMaterial = view.materials[0];
            view.materials[0] = new THREE.MeshLambertMaterial( {
                color: 0xFFFFFF, shading: THREE.SmoothShading,
                map : THREE.ImageUtils.loadTexture( "assets/images/game/jumppad.png" )
            });

            // Swap restitution
            this.swapRestitution( body );


            // Listen for body change
            this.intercept(['setBody', 'height']);
		},

        /**
         * Sets the restitution level of  the provided body's fixtures to make it a jumppad
         * @param {Box2D.Dynamics.b2Body} aBody
         */
        swapRestitution: function( aBody ) {
            var node = aBody.GetFixtureList();
            while(node) {
                var fixture = node;
                node = fixture.GetNext();

                this._previousRestitution = fixture.GetRestitution();
                fixture.SetRestitution(2);
            }
        },

        /**
         * Set the body
         * @param {Box2D.Dynamics.b2Body} aBody
         */
        setBody: function( aBody ) {
            this.interceptedProperties.setBody.call(this.attachedEntity, aBody );
            if(aBody) // Sometimes setBody is called with null
                this.swapRestitution( aBody )
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
            this.attachedEntity.getView().materials[0] = this._previousMaterial;

            var node = this.attachedEntity.getBody().GetFixtureList();
            while(node) {
                var fixture = node;
                node = fixture.GetNext();
                fixture.SetRestitution(this._previousRestitution);
            }

            ChuClone.components.JumpPadComponent.superclass.detach.call(this);
        }

	};

    ChuClone.extend( ChuClone.components.JumpPadComponent, ChuClone.components.BaseComponent );
})();