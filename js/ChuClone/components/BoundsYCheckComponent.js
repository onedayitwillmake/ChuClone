/**
File:
	BoundsYCheckComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	Respawns an entity if it falls below certain bounds

 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";

	ChuClone.namespace("ChuClone.components");

	ChuClone.components.BoundsYCheckComponent = function() {
		ChuClone.components.BoundsYCheckComponent.superclass.constructor.call(this);
		this.requiresUpdate = true;
	};

	ChuClone.components.BoundsYCheckComponent.prototype = {
		displayName						: "BoundsYCheckComponent",					// Unique string name for this Trait

		_minY							: 0.006,

		update: function() {
			// TODO: USING MAGIC NUMBER TO REPRESENT FLOOR
			if(this.attachedEntity.getBody().GetPosition().y > 7) {
			   var respawnPoint = ChuClone.components.RespawnComponent.prototype.GET_CURRENT_RESPAWNPOINT().setSpawnedEntityPosition( this.attachedEntity );

                var flippedVelocity = this.attachedEntity.getBody().GetLinearVelocity().Copy();
                flippedVelocity.Multiply( -3 );
                this.attachedEntity.getBody().SetLinearVelocity( flippedVelocity );
			}
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
            ChuClone.components.BoundsYCheckComponent.superclass.detach.call(this);
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.BoundsYCheckComponent.superclass.getModel.call(this);
            returnObject.minY = this._minY;
            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data ) {
            ChuClone.components.BoundsYCheckComponent.superclass.fromModel.call(this, data);
            this._minY = data.minY;
        }

	};

    ChuClone.extend( ChuClone.components.BoundsYCheckComponent, ChuClone.components.BaseComponent );
})();