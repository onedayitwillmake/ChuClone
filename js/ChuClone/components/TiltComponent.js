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

	var TO_RADIANS = ChuClone.model.Constants.TO_RADIANS;
	var TO_DEGREES= ChuClone.model.Constants.TO_DEGREES;

	ChuClone.namespace("ChuClone.components");

	ChuClone.components.TiltComponent = function() {
		ChuClone.components.TiltComponent.superclass.constructor.call(this);
		this._angle = 0;

		if( ChuClone.model.Constants.IS_EDIT_MODE() ) {
			this.requiresUpdate = true;
		}
	};

	ChuClone.components.TiltComponent.prototype = {
		displayName						: "TiltComponent",					// Unique string name for this Trait
		_previousAngle				: 0,
		_angle							: 0,
		_editableProperties				: {angle: {min: -15, max: 15, step: 5, value: 0}},

		/**
         * Restore material and restitution
         */
        attach: function( anEntity) {
            ChuClone.components.TiltComponent.superclass.attach.call(this, anEntity);

			// Swap angles
			this._previousAngle = this.attachedEntity.getBody().GetAngle() * TO_DEGREES;
			this.attachedEntity.getBody().SetAngle( this._angle * TO_RADIANS);
        },

		/**
		 * @inheritDoc
		 */
		update: function() {
			this.attachedEntity.getBody().SetAngle( this._angle * TO_RADIANS );
		},


		/**
         * Set the '_editableProperties' object to our values
         */
        setEditableProps: function() {
			this._editableProperties.angle.value = this._angle;
		},

		/**
		 * @inheritDoc
		 */
		onEditablePropertyWasChanged: function() {
			this._angle = this._editableProperties.angle.value;
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
			this.attachedEntity.getBody().SetAngle( this._previousAngle * TO_RADIANS);
			//ChuClone.components.TiltComponent.superclass.detach.call(this);
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.TiltComponent.superclass.getModel.call(this);
            returnObject.angle = this._angle;
            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data, futureEntity ) {
            ChuClone.components.TiltComponent.superclass.fromModel.call(this, data);
			this._angle = data.angle;
        }

	};

    ChuClone.extend( ChuClone.components.TiltComponent, ChuClone.components.BaseComponent );
})();