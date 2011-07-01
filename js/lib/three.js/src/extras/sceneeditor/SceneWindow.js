/**
File:
	ScenePlotter.js
Created By:
 	Mario Gonzalez
Project:
	N/A
Abstract:
 	A 2D window which maps two 3D coordinates
 	Based on the Zeh Fernando's Tweener bezier example
Basic Usage:
 	var sceneWindow = new THREE.SceneEditor.ScenePlotter(this);
		sceneWindow.setSize(100, 100);
		sceneWindow.create();
		sceneWindow.setAxis('xy');
		sceneWindow.setMapScale(0.1);
		sceneWindow.setWorldOffset(this._worldOffset);
		sceneWindow.setCanvas(this._canvas);

 	var cube = new Cube();

 	sceneWindow.startPlottingObject(anObject, shapeType, useOffset, makeDraggable)
*/
(function() {
	THREE.SceneEditor.SceneWindow = THREE.SceneEditor.SceneWindow || function()
	{
		this._position = new THREE.Vector2(0, 0);
		this._offset = new THREE.Vector2(0, 0);

		return this;
	};

	THREE.SceneEditor.SceneWindow.prototype =
	{
		/**
		 * @param	{HTMLCanvasElement} An html canvas instance
		 */
		_canvas		: null,

		/**
		 * @param {CanvasContext}	A  HTMLCanvasElement 2d context
		 */
		_context	: null,

		_axis1		: '', 	// X / Y / Z
		_axis2		: '',		// X / Y / Z

		// Size of this window
		_position	: null,
		width		: 0,
		widthHalf	: 0,
		height		: 0,
		heightHalf	: 0,

		// Can be applied to offset drawn position of objects
		_offset		: null,			// 2D Offset used to convert to cartesian coordinates as well as applied after panning
		_worldOffset: null, 	// 3D Offset used to offset 3D scene values, if for example the entire scene is moved 1000 pixels to the left

		// Scale the position of all objects
		_mapScale	: 0,

		// Lookup table for objects we plot
		_objects	: new THREE.SceneEditor.SortedLookupTable(),

		// SceneEditor
		_delegate	: null,

		// Mouse
		_isBeingDragged	: false, // For panning, not implemented yet
		_draggedDot		: null,	// Pointer to the currently being dragged dot

		create: function()
		{
			if(this.width === 0) {
				throw new Error('Size not set, please call setSize before calling create!');
			}

			this._offset = new THREE.Vector2(this.width*0.5, this.height*0.5); // Convert to cartesian coordinates
			return this;
		},

		/**
		 * Adds an object to be plotted.
		 * Objects are not added if they are already exist in this SceneEditor.
		 * @param {THREE.Object3D|THREE.Vector3} anObject The object to plot. Can be Object3D or Vector3D
		 * @param {String} shapeType The shape represent this object with. Can be 'square', 'triangle', 'circle'
		 * @return {THREE.SceneEditor.ScenePlotterDot}	The dot that represents the object passed in.
		 */
		startPlottingObject: function(anObject, shapeType, useOffset, makeDraggable)
		{
			if(anObject == null)
				throw new Error('Cannot plot null object!');

			if(!anObject.name || anObject.name === "")
				throw new Error("Object has no 'name' property, cannot add to object list!");

			// Check if Already made this object
			var windowDot = this._objects.objectForKey(anObject.name);

			// Already created
			if(windowDot)
				return windowDot;

			// Create and return
			windowDot  = new THREE.SceneEditor.ScenePlotterDot()
					.create(anObject, shapeType, this, useOffset);
			this._objects.setObjectForKey(windowDot, anObject.name);

//			if(makeDraggable)
//				windowDot.enableDrag();

			return windowDot;
		},

		/**
		 * Main loop
		 */
		update: function()
		{
			this._context.save();
			this._context.translate(this._position.x, this._position.y);
			this._context.clearRect(0, 0, this.width, this.height);


			this.drawBounds();
			this.drawLabel();

			// Plot all objects in the scene (as defined by objects dictionary)
			this._objects.forEach( function(key, windowDot)
			{
				this.plot(windowDot);
				windowDot.draw(this._context);
			}, this);

			// Restore
			this._context.closePath();
			this._context.restore();
		},

		drawBounds: function()
		{
			this._context.beginPath();

			this._context.strokeStyle = 'rgba( 37, 52, 109, 0.5)';
			this._context.fillStyle = 'rgba(255, 226, 246, 1)';
			this._context.lineWidth = 1;

			// Draw background with stroke
			this._context.moveTo(1, 1);
			this._context.lineTo(this.width-2, 1);
			this._context.lineTo(this.width-2, this.height-2);
			this._context.lineTo(1, this.height-2);
			this._context.lineTo(1, 1);
			this._context.fill();
			this._context.stroke();


			// Draw cross
			this._context.moveTo(this.widthHalf, 1);
			this._context.lineTo(this.widthHalf, this.height-2);
			this._context.moveTo(1, this.heightHalf);
			this._context.lineTo(this.width-2, this.heightHalf);
			this._context.stroke();
			this._context.closePath();
		},

		drawLabel: function()
		{
			this._context.font = "bold 12px sans-serif";;
			this._context.fillStyle = 'rgba(89, 108, 179, 0.5)';
			this._context.textAlign = 'left';
			this._context.textBaseline = 'top';
			this._context.fillText( this.getType() , 4, 4);
		},

		/**
		 * Draws a single dot in our graph according to where it's '_ownerObject' is located 3D Space
		 * @param aDot
		 */
		plot: function (aDot)
		{
			if(aDot._isBeingDragged)
				return;

			aDot.x = this.convertAxisToLocalX(aDot._ownerObject.position[this._axis1], this._axis1, aDot._useOffset);
			aDot.y = this.convertAxisToLocalY(aDot._ownerObject.position[this._axis2], this._axis2, aDot._useOffset);
		},

		/**
		 * Called by a dot as it's being dragged by the user
		 * @param {THREE.Vector2}	mousePosition	Mouse position
		 * @param {THREE.SceneEditor.ScenePlotterDot} aDot The dot being dragged which called this function
		 */
		dragDot: function(mousePosition, aDot)
		{
			// Convert to relative position
			var relativeMouseX = mousePosition.x-this._position.x,
				relativeMouseY = mousePosition.y-this._position.y;

			// Place at new position
			aDot.x = relativeMouseX;
			aDot.y = relativeMouseY;


			// Update ownerObject
			aDot._ownerObject.position[this._axis1] = this.convertLocalXToAxis(relativeMouseX, this._axis1, aDot._useOffset);
			aDot._ownerObject.position[this._axis2] = this.convertLocalYToAxis(relativeMouseY, this._axis2, aDot._useOffset);
		},

		/**
		 * Conversion of between local to scenes 3d space and back
		 * @param aValue
		 * @param axis
		 * @param applyOffset
		 * @return
		 */
		convertAxisToLocalX: function (aValue, axis, applyOffset)
		{
		   	var worldOffset = (applyOffset) ? this._worldOffset[axis] : 0;
			return this._offset.x + (aValue-worldOffset) * this._mapScale;
		},

		convertLocalXToAxis: function (aValue, axis, applyOffset)
		{
			var converted = (aValue-this._offset.x) / this._mapScale;
			var worldOffset = (applyOffset) ? this._worldOffset[axis] : 0;
			return converted + worldOffset;
		},

		convertAxisToLocalY: function (aValue, axis, applyOffset)
		{
		   	var worldOffset = (applyOffset) ? this._worldOffset[axis] : 0;
			return this._offset.y + (aValue-worldOffset) * -this._mapScale;
		},

		convertLocalYToAxis: function (aValue, axis, applyOffset)
		{
			var converted = (aValue-this._offset.y) / -this._mapScale;
			var worldOffset = (applyOffset) ? this._worldOffset[axis] : 0;
			return converted + worldOffset;
		},

		/////// Memory Management
		/**
		 * Removes a dot from this SceneEditor
		 * @param {*} anObject An object which is being plotted
		 */
		stopPlottingObject: function(anObject)
		{
			if(!anObject.name || anObject.name === "")
				throw new Error("Object has no 'id' property, cannot add to object list!");

			var windowDot = this._objects.objectForKey(anObject.id);

			// If it exist get rid of it
			if(windowDot) {
				windowDot.dealloc();
			}
			this._objects.remove(windowDot.id);
		},

/////	UserInteraction
		mouseDown: function(mousePosition)
		{
			// Convert to relative position
			var relativeMouseX = mousePosition.x-this._position.x + this._offset.x/2,
				relativeMouseY = mousePosition.y-this._position.y + this._offset.y/2;

            console.log("SceneWindow::MouseDown on", relativeMouseX, relativeMouseY, this._axis1 + this._axis2 );

			// Get first dot under mouse
			var dotUnderMouse = this.getDotAt(relativeMouseX, relativeMouseY);

			// Ignore if not within this object
			if(!dotUnderMouse)
				return;

			this._draggedDot = dotUnderMouse;
		},

		mouseMove: function(mousePosition)
		{
			if(!this._draggedDot)
				return;

			this.dragDot(mousePosition, this._draggedDot);
		},

		mouseUp: function(mousePosition)
		{
			this._draggedDot = null;
		},

/////	Memory Management
		dealloc: function()
		{
			this._objects.forEach( function(key, windowDot) {
				windowDot.dealloc();
			}, this);
			this._objects.dealloc();
			this._objects = null;

//			this.stopDragging(null);

//			_currentDragPosition = null;
			this._offset = null;
			this._objects = null;
			this._delegate = null;
		},

/////// ACCESSORS
		/**
		 * Sets the Axis we want to map
		 * @param {String} axisString A string in the form of 'xy' or 'XZ' for example
		 */
		setAxis: function (axisString)
		{
			this._axis1 = axisString.toLocaleLowerCase().substr(0, 1);
			this._axis2 = axisString.toLocaleLowerCase().substr(1, 1);

			return this;
		},

		setPosition: function(posX, posY)
		{
			this._position.x = posX;
			this._position.y = posY;
			return this;
		},

		/**
		 * Size of this SceneEditor in pixels
		 * @param aWidth
		 * @param aHeight
		 */
		setSize: function(aWidth, aHeight)
		{
			this.width = aWidth;
			this.widthHalf = this.width >> 1;

			this.height = aHeight;
			this.heightHalf = this.height >> 1;

			this._offset = new THREE.Vector2(this.width*0.5, this.height*0.5); // Convert to cartesian coordinates

			return this;
		},

		/**
		 * Set how much to scale 3D world space by.
		 * @param {Number} aMapScale A number between 0.0-1.0 where 1.0 is not downscaled at all
		 */
		setMapScale: function(aMapScale)
		{
			this._mapScale = aMapScale;

//			if(_numericStepper)
//				_numericStepper.value = _mapScale;
			return this;
		},

		setWorldOffset: function(aWorldOffset)
		{
			this._worldOffset = aWorldOffset;

			return this;
		},

		setCanvas: function(aCanvas)
		{
			this._canvas = aCanvas;
			this._context = this._canvas.getContext('2d');

			return this;
		},

		getDotAt: function(posX, posY) {
			var focusedDot = null;
			this._objects.forEach( function(key, windowDot) {
				// Match already found
				if(focusedDot)
					return;

				if( windowDot.pointInside(posX, posY) )
					focusedDot = windowDot;

			}, this);

			return focusedDot;
		},

		getType: function() {
			 return (this._axis1+ this._axis2).toUpperCase()
		},

		pointInside: function(pointX, pointY) {
			return pointX >= this._position.x
					&& pointX < (this._position.x+this.width)
					&& pointY >= this._position.y
					&& pointY < (this._position.y+this.height);
		}

	}
})();
