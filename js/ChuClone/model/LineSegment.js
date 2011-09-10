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
	var b2Vec2 = Box2D.Common.Math.b2Vec2;

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

			this._angle = Math.atan2(this._a.y - this._b.y, this._a.x - this._b.x);
			this._angleDirty = false;

			return this._angle;
		},

		/**
		 * @return {Number}
		 */
		getLength: function() {
			if(!this._distanceDirty) return this._distance;

			this._distance = Box2D.Common.Math.b2Math.Distance( this._a, this._b );
			this._distanceDirty = false;

			return this._distance
		},

		flip: function() {
			var temp = this._a.Copy();
			this.setA( this._b );
			this.setB( temp );
		},

		rotate: function(angle) {

			// Find the mid-point between A and B
			var center = this._a.Copy();
			center.Add( this._b );
			center.Multiply( 0.5 );


			var na = this._a.Copy();
			na.Subtract(center);

			var nb = this._b.Copy();
			nb.Subtract(center);


			// Rotate each component in the vector by angle
			var rotateVector = function( v, angle ) {
				var s = Math.sin(angle);
				var c = Math.cos(angle);

				var nx = c * v.x - s * v.y;
				var ny = s * v.x + c * v.y;

				v.x = nx;
				v.y = ny;
			};

			// Rotate, then untranslate it back to center
			rotateVector(na, angle);
			na.Add( center );

			// Rotate, then untranslate it back to center
			rotateVector(nb, angle);
			nb.Add( center );

			this._a = na;
			this._b = nb;
			this._angleDirty = this._distanceDirty = true;
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
		 * @return ChuClone.model.LineSegment
		 */
		clone: function() {
			return new ChuClone.model.LineSegment( this._a, this._b );
		},

		/**
		 * Creates a line segment from 4 points
		 * @param {Number} x0
		 * @param {Number} y0
		 * @param {Number} x1
		 * @param {Number} y1
		 */
		FROM_POINTS: function( x0, y0, x1, y1 ) {
			var a = new b2Vec2(x0, y0);
			var b = new b2Vec2(x1, y1);
			return new ChuClone.model.LineSegment(a, b);
		},

		FROM_VECTORS_AND_OFFSET: function( offset, a, b ) {
			var pointA = new b2Vec2(offset.x + a.x, offset.y + a.y);
			var pointB = new b2Vec2(offset.x + b.x, offset.y + b.y);
			return new ChuClone.model.LineSegment(pointA, pointB);
		},


		/**
		 * Creates an array lines from a b2Body
		 * @param {Box2D.Dynamics.b2Body} aBody
		 * @return {Array} An array of lines
		 */
		FROM_BODY: function( aBody ) {
			var bodyPos = aBody.GetPosition();
			var shape = aBody.GetFixtureList().GetShape();

			var lineA = ChuClone.model.LineSegment.prototype.FROM_VECTORS_AND_OFFSET( bodyPos, shape.m_vertices[0], shape.m_vertices[1] );
			var lineB = ChuClone.model.LineSegment.prototype.FROM_VECTORS_AND_OFFSET( bodyPos, shape.m_vertices[1], shape.m_vertices[2] );
			var lineC = ChuClone.model.LineSegment.prototype.FROM_VECTORS_AND_OFFSET( bodyPos, shape.m_vertices[2], shape.m_vertices[3] );
			var lineD = ChuClone.model.LineSegment.prototype.FROM_VECTORS_AND_OFFSET( bodyPos, shape.m_vertices[3], shape.m_vertices[0] );

			return [lineA, lineB, lineC, lineD];
		},

		/**
		 * Intersects two lines
		 * @param {ChuClone.model.LineSegment} line1
		 * @param {ChuClone.model.LineSegment} line2
		 * @return {Array} Array of points where the lines intersect
		 */
		INTERSECT_LINES: function( line1, line2 ) {
			function intersectLineLine(a1, a2, b1, b2) {
				var result = [];
				var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
				var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
				var u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

				if (u_b != 0) {
					var ua = ua_t / u_b;
					var ub = ub_t / u_b;


					// See if T is between 0.0 - 1.0
					if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
						var x = a1.x + ua * (a2.x - a1.x);
						var y = a1.y + ua * (a2.y - a1.y);
						var point = new Box2D.Common.Math.b2Vec2(x, y);
						result.push(point);
					} else { // Lines are coincident... count anyway?

					}
				} else {
				}
				return result;
			}

			return intersectLineLine(line1._a, line1._b, line2._a, line2._b);
		}
	};
})();