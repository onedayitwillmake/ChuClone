
/**
File:
	SceneEditor.js
Created By:
 	Mario Gonzalez
Project:
	N/A
Abstract:
 	A container for ScenePlotters and is in charge of passing mouse information to them
 	Based on the Zeh Fernando's Tweener bezier example
Basic Usage:

	var sceneEditor = new THREE.SceneEditor();
	sceneEditor.setCanvas( renderer.domElement );
	sceneEditor.create();
	sceneEditor.setWorldOffset( camera.position );

 	// Make 3 windows
	var axis = ['xz', 'xy', 'zy'],
		scales = [0.11, 0.11, 0.11];

	var xBuffer = 5,
		yBuffer = 50,
		xSpacing = 5;

	var plotterSize = 150;

	for(var i = 0; i < axis.length; i++) {
		var aScenePlotter = sceneEditor.addScenePlotter(axis[i], scales[i], windowSize);
		aScenePlotter.setPosition(i * (windowSize + xSpacing) + xBuffer, yBuffer);
	}

 	var cube = new Cube();

 	sceneWindow.startPlottingObject(anObject, shapeType, useOffset, makeDraggable)
*/
(function() {
	THREE.SceneEditor = THREE.SceneEditor || function()
	{
		this._sceneWindows = [];

		this._worldOffset = new THREE.Vector2(0, 0);

		this._isActive = true;

		return this;
	};

	THREE.SceneEditor.prototype = {

		// CANVAS
		_canvas:		null,
		_context:		null,

		// Mouse
		_mousePosition	: null,

		_sceneWindows: null,		// Array of ScenePlotters
		_worldOffset:	null,		// Optional parameter which may be used to offset ALL positions of objects

		// State
		_hasOwnCanvas	: false,	//
		_isActive		: false,  	// If false, will not redraw

		create: function () {

			if(!this._canvas)
				throw new Error("Canvas is null, please supply a canvas element before calling create!");

		   return this;
		},

		/**
		 * Creates own canvas element.
		 * Not implemented yet!
		 */
		createOwnCanvas: function()
		{
			//container.appendChild( debugCanvas );
			var aCanvas = document.createElement( 'canvas' );
				aCanvas.width = 100;
				aCanvas.height = 100;
				aCanvas.style.position = 'absolute';
				aCanvas.style.top = '0px';
				aCanvas.style.left = '0px';

			this.setCanvas(aCanvas);
			this._hasOwnCanvas = true;
			return this;
		},

		/**
		 * Updates ScenePlotters instances
		 */
		update: function()
		{
		   if(!this._isActive)
			   return;

            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height );
			var len = this._sceneWindows.length;
			for(var i = 0; i < len; i++) {
				this._sceneWindows[i].update();
			}
		},

		/**
		 * Creates a new ScenePlotter and returns it.
		 * @param {String} axis	A string in the form of 'xy', 'xz', 'zy', etc
		 * @param {Number} mapScale	How much to scale the points being plotted relative to their 3D position
		 * @param {Number} size	Square dimensions of the SceneWindow in pixels
		 */
		addScenePlotter: function(axis, mapScale, size)
		{
			var sceneWindow = new THREE.SceneEditor.SceneWindow(this);
			sceneWindow.setSize(size, size);
			sceneWindow.create();
			sceneWindow.setAxis(axis);
			sceneWindow.setMapScale(mapScale);
			sceneWindow.setWorldOffset(this._worldOffset);
			sceneWindow.setCanvas(this._canvas);

			this._sceneWindows.push(sceneWindow);

			return sceneWindow;
		},

		/**
		 * Adds an object to be plotted.
		 * Objects are not added if they are already exist in this SceneEditor.
		 * @param {THREE.Object3D|THREE.Vector3} anObject The object to plot. Can be Object3D or Vector3D
		 * @param {String} shapeType The shape represent this object with. Can be 'square', 'triangle', 'circle'
		 */
		startPlottingObject: function(anObject, shapeType, useOffset, makeDraggable)
		{
			if(anObject == null)
				throw new Error('Cannot plot null object!');

			for(var i = 0; i < this._sceneWindows.length; i++) {
				this._sceneWindows[i].startPlottingObject(anObject, shapeType, useOffset, makeDraggable)
			}
		},

		/**
		 * Removes a dot from this SceneEditor
		 * @param {*} anObject The object which was previously passed to addIfNull
		 */
		stopPlottingObject: function(anObject)
		{
			for(var i = 0; i < this._sceneWindows.length; i++) {
				this._sceneWindows[i].stopPlottingObject(anObject);
			}
		},
//////	MouseEvents
		initMouseEvents: function()
		{
			this._mousePosition = new THREE.Vector2(0, 0);

			// TODO: move from anonymous function
			// listen for the mouse
			var that = this;
			window.addEventListener("mousemove", function(e) {
				that.mouseMove(e);
			}, true);

			window.addEventListener("mousedown", function(e) {
				that.mouseDown(e);
			}, true);

			window.addEventListener("mouseup", function(e) {
				that.mouseUp(e);
			}, true);
		},

		getPlotterAt: function(aPosition) {
			var focusedPlotter = null;
			var len = this._sceneWindows.length;

			for(var i = 0; i < len; i++) {
				if( this._sceneWindows[i].pointInside(aPosition.x, aPosition.y) ) {
					focusedPlotter = this._sceneWindows[i];
					break;
				}
			}

			return focusedPlotter;
		},

		/**
		 * MouseDown event. Detect new chain
		 * @param e
		 */
		mouseDown: function(e)
		{
			this.updateMousePosition(e);
			var anActivePlotter = this.getPlotterAt(this._mousePosition);

			// Ignore if not within this object
			if(!anActivePlotter)
				return;

			this._activePlotter = anActivePlotter;

			this._activePlotter.mouseDown(this._mousePosition)
		},

		/**
		 * MouseMove function. Ignored if MouseDown did not set this.isDragging to true
		 * @param e
		 */
		mouseMove: function(e)
		{
			if(!this._activePlotter)
				return;

			this.updateMousePosition(e);
			this._activePlotter.mouseMove(this._mousePosition);
		},

		/**
		 * MouseUp event, release chains
		 * @param e
		 */
		mouseUp: function(e)
		{
			if(!this._activePlotter)
				return;

			this.updateMousePosition(e);

			this._activePlotter.mouseUp();
			this._activePlotter = null;
		},

		updateMousePosition: function(e)
		{
			var x = 0,
				y = 0;

			// Get the mouse position relative to the canvas element.
			if (e.layerX || e.layerX == 0) { // Firefox
				x = e.layerX;
				y = e.layerY;
			} else if (e.offsetX || e.offsetX == 0) { // Opera
				x = e.offsetX;
				y = e.offsetY;
			}
			// Offset
			this._mousePosition.x = x - this._canvas.offsetLeft;
			this._mousePosition.y = y - this._canvas.offsetTop;
		},

//////	Memory Management
		dealloc: function()
		{
			for(var i = 0; i < this._sceneWindows.length; i++) {
				this._sceneWindows.length[i].dealloc();
			}

			if(this._canvas)
				this._canvas.removeEventListener('mousedown', this.mouseDown, false)
		},

////// Accessors
		setCanvas: function(canvas)
		{
			this._canvas = canvas;
			this._context = this._canvas.getContext('2d');

			this.initMouseEvents();
			return this;
		},

		/**
		 * Sets or updates the worldOffset which is taken into account when reading/writing points to/from 3D space
		 * @param {THREE.Vector2} aWorldOffset A vector3D instance to use as the world offset
		 */
		setWorldOffset: function(aWorldOffset)
		{
			if(!this._worldOffset) {
				this._worldOffset = aWorldOffset.clone();
			} else {
				this._worldOffset.x = aWorldOffset.x;
				this._worldOffset.y = aWorldOffset.y;
				this._worldOffset.z = aWorldOffset.z;
			}
		},

        setIsActive: function( value ) {
            this._isActive = value;
            if(!this._isActive) {
                this._context.clearRect( this._canvas.width, this._canvas.height );
            }
        },
        getIsActive: function(){ return this._isActive; },

		pointInside: function(pointX, pointY) {
			return pointX >= this._position.x && pointX < this.width && pointY >= this._position.x && pointY < this.height;
		},

		// DEBUG - While editing, I have to keep replacing, readding the final comma, this makes Intelli-j leave me alone - should be removed
		end: 0
	};
})();