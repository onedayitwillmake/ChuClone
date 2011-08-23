/**
File:
	TutorialNoteComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	This class is created when a user starts dragging while holding the shift key in the editor.
 	It constrains movement to one axis

 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/
*/
(function(){
	ChuClone.namespace('ChuClone.editor');

	/**
	 *
	 * @param {Box2D.Common.Math.b2Vec2} anInitialPosition
	 */
	ChuClone.editor.ShiftDragHelper = function( anInitialPosition ){
		this._mouseStartPosition = anInitialPosition.Copy();
	};

	ChuClone.editor.ShiftDragHelper.prototype = {
		/**
		 * @type {Box2D.Common.Math.b2Vec2}
		 */
		_mouseStartPosition	: null,

		/**
		 * @type {Box2D.Common.Math.b2Vec2}
		 */
		_delta				: null,

		/**
		 * The axis of movement
		 * @type {String}
		 */
		_axis				: null,


		MIN_DISTANCE		: 20,

		/**
		 * Constrains the mouse along a single axis
		 * @param {Box2D.Common.Math.b2Vec2} aMousePosition
		 * @return {Box2D.Common.Math.b2Vec2} Updated mouse position
		 */
		adjustPosition: function( aMousePosition ) {

			if(!this._axis) {
				var deltaX = Math.abs( aMousePosition.x - this._mouseStartPosition.x );
				var deltaY = Math.abs( aMousePosition.y - this._mouseStartPosition.y );
				var distance = Math.sqrt( deltaX*deltaX + deltaY*deltaY );

				if( distance > ChuClone.editor.ShiftDragHelper.prototype.MIN_DISTANCE ) {
					this._axis = deltaX > deltaY ? "x" : "y";
				}

				// Return the position as it was given
				return aMousePosition
			}

			// Constrain
			aMousePosition.x = this._axis == 'x' ? aMousePosition.x : this._mouseStartPosition.x;
			aMousePosition.y = this._axis == 'y' ? aMousePosition.y : this._mouseStartPosition.y;

			return aMousePosition
		},

		/**
		 * Deallocates memory
		 */
		dealloc: function() {
			this._mouseStartPosition = null;
			this._delta = null;
		}
	}
})();