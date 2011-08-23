/**
File:
	TutorialNoteComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	When collision with player, emits a note used in the early tutorial levels to teach the player about the blocks

 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";
    
	ChuClone.namespace("ChuClone.components.misc");
	ChuClone.components.misc.TutorialNoteComponent = function() {
		ChuClone.components.misc.TutorialNoteComponent.superclass.constructor.call(this);
	};

	ChuClone.components.misc.TutorialNoteComponent.prototype = {
		displayName						: "TutorialNoteComponent",					// Unique string name for this Trait

		/**
		 * @type {String}
		 */
		_message						: '',

		/**
		 * Can only be hit once
		 * type {Boolean}
		 */
		_isReady						: true,

		/**
		 * @type {Number}
		 */
		_destroyNoteTimeout				: null,

		/**
		 * @type {Object}
		 */
		_editableProperties				: {message: ""},

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.misc.TutorialNoteComponent.superclass.attach.call(this, anEntity);
            // Intercept collision
            this.intercept(['onCollision']);
		},

        /**
         * @inheritDoc
         */
        onCollision: function( otherActor ) {
            if( otherActor._type != ChuClone.model.Constants.ENTITY_TYPES.PLAYER )
                return;

			//<strong>Thats the stuff!</strong><br><span class="jura_18">Now lets get some speed!<br>Chu loves the speed.<br>
			//See t  hat <strong>green</strong> block over there?<br><strong>Touch</strong> it to complete the level!
			//<strong>Thats the stuff!</strong><br><span class="jura_18">Now lets get some speed!<br>Chu all about speed.<br>The wind in Chu's perfectly aerodynamic body.</span>
			// <strong>Alright!</strong><br>Now here comes a <strong>jumppad</strong><br><br><span class="jura_24">Get ready!</span>
			// <strong>Nice Landing!</strong><br>Lets do another one!
			//<br>Now here comes a <strong>jumppad</strong><br><br><span class="jura_24">Get ready!</span>
			// <strong>Alright!</strong><br>Now here comes a <strong>jumppad</strong>
            this.interceptedProperties.onCollision.call(this.attachedEntity, otherActor );
            if( !this._isReady || ChuClone.model.Constants.IS_EDIT_MODE() ) return;
			this._isReady = false;

			var input = otherActor.getComponentWithName(ChuClone.components.player.KeyboardInputComponent.prototype.displayName);

			// Slow down
			otherActor.getBody().SetLinearVelocity( new Box2D.Common.Math.b2Vec2(0, 0) );

			//input.resetState();

			ChuClone.gui.TutorialNoteDisplay.show(this._message);

			var that = this;
			this._destroyNoteTimeout = setTimeout( function(){
				if( ChuClone.gui.TutorialNoteDisplay.noteText == that._message ) {
					ChuClone.gui.TutorialNoteDisplay.fadeOutAndDestroy();
				}

				//that._destroyNoteTimeout = null;
			}, ChuClone.model.Constants.TIMINGS.TUTORIAL_FADE_OUT_TIME);
        },

		 /**
         * Set the '_editableProperties' object to our values
         */
        setEditableProps: function() {
			this._editableProperties.message = this._message;
        },

		/**
		 * @inheritDoc
		 */
		onEditablePropertyWasChanged: function() {
			this._message = this._editableProperties.message;
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
            ChuClone.components.misc.TutorialNoteComponent.superclass.detach.call(this);
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.misc.TutorialNoteComponent.superclass.getModel.call(this);
            returnObject.message = this._message;
            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data, futureEntity ) {
            ChuClone.components.misc.TutorialNoteComponent.superclass.fromModel.call(this, data);
            this._message = data.message;
        }

	};

    ChuClone.extend( ChuClone.components.misc.TutorialNoteComponent, ChuClone.components.BaseComponent );
})();