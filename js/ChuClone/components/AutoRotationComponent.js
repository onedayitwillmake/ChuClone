/**
File:
	AutoRotationComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	When collision with player, fires a AutoRotationComponent.events.DID_REACH_GOAL event

 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";
    
	ChuClone.namespace("ChuClone.components");

	ChuClone.components.AutoRotationComponent = function() {
		ChuClone.components.AutoRotationComponent.superclass.constructor.call(this);
		this.requiresUpdate = true;
	};

	ChuClone.components.AutoRotationComponent.prototype = {
		displayName						: "AutoRotationComponent",					// Unique string name for this Trait
		_previousRotation				: 0,
		_rotationSpeed					: 0.006,

		update: function() {
			this.attachedEntity.getBody().SetAngle( this.attachedEntity.getBody().GetAngle() + this._rotationSpeed );
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
            this.attachedEntity.getBody().SetAngle( this._previousRotation );
            ChuClone.components.AutoRotationComponent.superclass.detach.call(this);
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.AutoRotationComponent.superclass.getModel.call(this);
            returnObject.rotationSpeed = this._rotationSpeed;
            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data ) {
            ChuClone.components.AutoRotationComponent.superclass.fromModel.call(this, data);
            this._rotationSpeed = data.rotationSpeed;
        }

	};

    ChuClone.extend( ChuClone.components.AutoRotationComponent, ChuClone.components.BaseComponent );
})();