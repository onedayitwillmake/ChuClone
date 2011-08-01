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
		MINIMUM_Y						: 5,

		/**
		 * Checks if the entity is below what is considered the floor
		 */
		update: function() {
			if(this.attachedEntity.getBody().GetPosition().y > this.MINIMUM_Y) {
				var respawnPoint = ChuClone.components.RespawnComponent.prototype.GET_CURRENT_RESPAWNPOINT().setSpawnedEntityPosition( this.attachedEntity );
				this.attachedEntity.getBody().SetLinearVelocity( new Box2D.Common.Math.b2Vec2(0, 0) );
			}
		}
	};

    ChuClone.extend( ChuClone.components.BoundsYCheckComponent, ChuClone.components.BaseComponent );
})();