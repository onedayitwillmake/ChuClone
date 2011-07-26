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

	var r = 0;
	ChuClone.components.AutoRotationComponent = function() {
		ChuClone.components.AutoRotationComponent.superclass.constructor.call(this);
		this.requiresUpdate = true;
	};

	ChuClone.components.AutoRotationComponent.prototype = {
		displayName						: "AutoRotationComponent",					// Unique string name for this Trait
		_previousRotation				: 0,
		_rotationSpeed					: 0.006,
		_editableProperties				: {rotationSpeed: {min: -0.15, max: 0.15, value: 0}},

		update: function() {

//			this.attachedEntity.getBody().m_xf.R.Set( this.attachedEntity.getBody().GetAngle() + this._rotationSpeed );
			r+= this._rotationSpeed;
			this.attachedEntity.getBody().SetAngle(r);
		},

		/**
		 * @inheritDoc
		 */
		onEditablePropertyWasChanged: function() {
			if(this._editableProperties.rotationSpeed.value !== this._editableProperties.rotationSpeed.value) {
				debugger;
			}
			this._rotationSpeed = this._editableProperties.rotationSpeed.value;
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
        fromModel: function( data, futureEntity ) {
            ChuClone.components.AutoRotationComponent.superclass.fromModel.call(this, data);
            this._rotationSpeed = data.rotationSpeed;
        }

	};

    ChuClone.extend( ChuClone.components.AutoRotationComponent, ChuClone.components.BaseComponent );
})();