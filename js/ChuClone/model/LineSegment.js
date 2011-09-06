/**
 File:
    LineSegment.js
 Created By:
    Mario Gonzalez
 Project    :
    ChuClone
 Abstract:
    Represents a linesegment in the game. 
 	Mostly used for portal stuff
 Basic Usage:

  License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";
    
	ChuClone.namespace("ChuClone.model");

	/**
	 * Creates a new LineSegment
	 * @param {Box2D.Common.Math.b2Vec2} a
	 * @param {Box2D.Common.Math.b2Vec2} b
	 */
	ChuClone.model.LineSegment = function( a, b ) {
		this._angleDirty = true;
		this._distanceDirty = true;
		this._a = a.Copy();
		this._b = b.Copy();
	};

	ChuClone.model.LineSegment.prototype = {
		/**
		 * @type {Box2D.Common.Math.b2Vec2}
		 */
		_a	: null,

		/**
		 * @type {Box2D.Common.Math.b2Vec2}
		 */
		_b	: null,

		/**
		 * @type {Number}
		 */
		_angle	: 0,

		/**
		 * @type {Number}
		 */
		_distance : 0,

		/**
		 * @type {Boolean}
		 */
		_angleDirty : true,

		/**
		 * @type {Boolean}
		 */
		_distanceDirty : true,

		/**
		 * @return {Number}
		 */
		getAngle: function() {
			if(!this._angleDirty) return this._angle;

			this._angle = Math.atan2(this.a.y - this.b.y, this.a.x - this.b.x);
			this._angleDirty = false;

			return this._angle;
		},

		/**
		 * @return {Number}
		 */
		getLength: function() {
			if(!this._distanceDirty) return this._distance;

			this._distance = Box2D.Common.Math.b2Math.Distance( this.a, this.b );
			this._distance = false;
		},

        /**
         * Restore material and restitution
         */
        dealloc: function() {
			this._a = null;
			this._b = null;
        },

		///// ACCESSORS
		/**
		 * @param {Box2D.Common.Math.b2Vec2}
		 */
		setA: function( value ) {
			this._a = value.Copy();
			this._angleDirty = this._distanceDirty = true;
		},
		/**
		 * @param {Box2D.Common.Math.b2Vec2}
		 */
		setB: function( value ) {
			this._b = value.Copy();
			this._angleDirty = this._distanceDirty = true;
		},
		/**
		 * @return {Box2D.Common.Math.b2Vec2}
		 */
		getA: function() { return this._a.Copy(); },
		/**
		 * @return {Box2D.Common.Math.b2Vec2}
		 */
		getB: function() { return this._b.Copy(); },

		/**
		 * Creates a line segment from 4 points
		 * @param {Number} x0
		 * @param {Number} y0
		 * @param {Number} x1
		 * @param {Number} y1
		 */
		FROM_POINTS: function( x0, y0, x1, y1 ) {
			var a = new Box2D.Common.Math.b2Vec2(x0, y0);
			var b = new Box2D.Common.Math.b2Vec2(x1, y1);
			return new ChuClone.model.LineSegment(a, b);
		}
	};

    ChuClone.extend( ChuClone.model.LineSegment, ChuClone.components.BaseComponent );
})();