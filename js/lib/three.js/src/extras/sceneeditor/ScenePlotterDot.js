/**
File:
	ScenePlotterDot.js
Created By:
 	Mario Gonzalez
Project:
	N/A
Abstract:
 	This object represents, a single dot within a scene plotter
Basic Usage:
*/

(function() {
	THREE.SceneEditor.ScenePlotterDot = THREE.SceneEditor.ScenePlotterDot || function() {
		return this;
	};

	THREE.SceneEditor.ScenePlotterDot.prototype =
	{
///// 'Class' Properties
		TYPES: { SQUARE: 'square', CIRCLE: 'circle', TRIANGLE: 'triangle,' },
		FILLSTYLES: { 'square': 'rgba(242, 75, 167, 0.95)', 'circle': '#FF0000', 'triangle': '#FF0000' },

///// 'Instance' properties
		// Meta
		_delegate		: null,

		// Positioning
		x				: 0,
		y				: 0,
		width			: 10,
		widthHalf		: 0,
		height			: 10,
		heightHalf		: 0,

		_type			: 'null',	//  THREE.ScenePlotter.ScenePlotterDot.prototype.TYPE
		_ownerObject	: null, // An object containing XYZ properties

		// Drag
		_isDraggable	: false,
		_isBeingDragged	: false,

		_useOffset		: false,

		// Drawing
		_fillStyle		: '',

		create: function(anOwner, aType, aDelegate, useOffset)
		{
			this._ownerObject = anOwner;
			this._delegate = aDelegate;
			this._type = aType;
			this._useOffset = useOffset;

			this._fillStyle = THREE.SceneEditor.ScenePlotterDot.prototype.FILLSTYLES[this._type];

			this.widthHalf = this.width/2;
			this.heightHalf = this.height/2;

			return this;
		},

		draw: function(ctx)
		{
			// Draw object according to set '_type'
			this['draw'+this._type](ctx);
		},

		drawsquare: function(ctx)
		{
			ctx.fillStyle = this._fillStyle;
			ctx.fillRect(this.x-this.widthHalf, this.y-this.heightHalf, this.width, this.height);
		},

/////	ACCESSORS
		pointInside: function(pointX, pointY)
		{

            var deltaX = this.x - pointX;
			var deltaY = this.y - pointY;
            var dist = Math.sqrt( deltaX*deltaX + deltaY*deltaY  );
            console.log("this.y:", this.y, "pointY:", pointY, "deltaY", deltaY );
//			return

            //console.log(pointX, this.x)
//            bool Inisde( x, y, l, r, b, t )//x,y are the point, l,r,b,t are the extents of the rectangle{   }

            var l = this.x - this.width;
            var r = this.x;
            var t = this.y - this.height;
            var b = this.y + this.height;
//            console.log(pointX > l && pointX < r && pointY > t && pointY < b)
            var pastMinX = pointX > l;
            var beforeMaxX = pointX < r;
            var pastMinY = pointY > t;
            var beforeMaxY = pointY < b;
            console.log("PastMinX:"+pastMinX, "| BeforeMaxX:", beforeMaxX, "| PastMinY", beforeMaxY, "| BeforeMaxY:", beforeMaxY );
            return pointX > l && pointX < r && pointY > t && pointY < b;

			pointX += this.widthHalf;
			pointY += this.heightHalf;

			var deltaX = this.x - pointX;
			var deltaY = this.y - pointY;
			return (deltaX*deltaX + deltaY+deltaY) < this.width*this.width;

//			var buffer = 2;
//			var pointIsInside = pointX+this.width >= this.x
//					&& pointX < (this.x+this.widthHalf)
//					&& pointY >= this.y-this.heightHalf
//					&& pointY < (this.y+this.heightHalf);

//			console.log(pointIsInside
//					,'xMin', pointX+this.widthHalf >= this.x, pointX+this.widthHalf, this.x
//					,"xMax", pointX < (this.x+this.widthHalf), pointX , (this.x+this.widthHalf)
//					,"yMin", pointY >= this.y-this.heightHalf, pointY , this.y-this.heightHalf
//					,"yMax", pointY < (this.y+this.heightHalf), pointY , (this.y+this.heightHalf));
//
			return pointIsInside;
		}
	};
})();