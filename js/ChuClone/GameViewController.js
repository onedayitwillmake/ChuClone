/**
 File:
    GameViewController.js
 Created By:
    Mario Gonzalez - mariogonzalez@gmail.com
 Project:
    ChuClone
 Abstract:
    Controls THREE.js rendering of ChuClone game instance
 
 Basic Usage:

  License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function() {
    "use strict";
    ChuClone.namespace("ChuClone");
    ChuClone.GameViewController = function() {

        this.setDimensions( ChuClone.Constants.GAME_WIDTH, ChuClone.Constants.GAME_HEIGHT );
        this.setupContainer();
        this.setupScene();
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupEvents();
        this.setupBackgroundParticleManager();

        this.onSetupComplete();
    };

    ChuClone.GameViewController.prototype = {

        /**
         * @type {HTMLDivElement}
         */
        _domElement: null,

        /**
         * @type {THREE.Scene}
         */
        _scene: null,

        /**
         * @type {THREE.SceneEditor}
         */
        _sceneEditor: null,

        /**
         * @type {THREE.Camera}
         */
        _camera: null,

        /**
         * @type {THREE.WebGLRenderer}
         */
        _renderer: null,

        /**
         * @type {THREE.AmbientLight}
         */
        _ambientLight: null,

        /**
         * @type {ChuClone.view.BackgroundParticleManager}
         */
        _backgroundParticleManager: null,

        /**
         * @type {THREE.Vector2}
         */
        _mousePosition: new THREE.Vector2(0, 0),

        /**
         * @type {THREE.Vector2}
         */
        _dimensions: null,
        /**
         * @type {Boolean}
         */
        _isFullScreen: false,

        /**
         * @type {Number}
         */
        NEXT_VIEW_UUID  : 0,

        /**
         * Sets up the HTMLElement that will contain our renderer
         */
        setupContainer: function() {

            // Create the container if none exist
            if( !document.getElementById("gameContainer") ) {
                this._domElement = document.createElement( 'div' );
                document.body.appendChild( this._domElement );
            } else {
                this._domElement = document.getElementById("gameContainer");
            }
        },

        /**
         * Setup the THREE.Scene used to hold our objects
         */
        setupScene: function() {
            this._scene = new THREE.Scene();
            this._scene.fog = new THREE.FogExp2( 0x000000, 0.00001 );
        },

        /**
         * Setup the WebGLRenderer that will draw our scene
         */
        setupRenderer: function() {
            this._renderer = new THREE.WebGLRenderer();
            this._renderer.sortObjects = false;
            this._renderer.setClearColor(new THREE.Color(0xFFFFFF), 1);
            this._renderer.setSize( this.getDimensions().x, this.getDimensions().y );

            this._renderer.domElement.tabIndex = "1";
            this._domElement.appendChild( this._renderer.domElement );
        },

        /**
         * Setup the camera
         */
        setupCamera: function() {
            this._camera = new THREE.Camera( 70, 900/400, 1, 30000 );
            this._camera.position.y = 100;
            this._camera.position.z = 1300;
//            this._camera._isFullScreen = this._isFullScreen;
            this._camera.name = "camera";
        },

        /**
         * Setup scene lights
         */
        setupLights: function() {
            this._ambientLight = new THREE.AmbientLight(0x608090);

            this._directionalLight = new THREE.DirectionalLight( 0x608090, 1.6, 0, true );
            this._directionalLight.position.set( 0, 2, 1 );

            this._scene.addLight( this._ambientLight );
            this._scene.addLight( this._directionalLight );
        },

        /**
         * Setup event callback bindings
         */
        setupEvents: function() {
            var that = this;
            window.addEventListener( 'resize', function(e) { that.onResize(e); }, false);
            document.addEventListener( 'mousemove', function(e){ that.onDocumentMouseMove(e)}, false );
        },

        /**
         * Setup event callback bindings
         */
        setupBackgroundParticleManager: function() {
            this._backgroundParticleManager = new ChuClone.view.BackgroundParticleManager();
            for( var i = 0; i < this._backgroundParticleManager.getSystems().length; i++ ) {
                this._scene.addObject( this._backgroundParticleManager.getSystems()[i] );
            }
        },


        /**
         * Called internally after all individual setup functions have been called.
         * Allows a chance for final initialization safely assuming various properties exist in correct state
         */
        onSetupComplete: function() {
//            this.loadSpaceSuit();
        },

        loadSpacesuit: function() {
            var that = this;
            var spacesuit;
            var loader = new THREE.JSONLoader();
            var onLoadedCallback = function(geometry) {
                spacesuit = new THREE.Mesh(geometry,
                    new THREE.MeshBasicMaterial({ color:0x000000, wireframe: true})
                );

                that.addObjectToScene(spacesuit);
                that.spacesuit = spacesuit;
            };
            loader.load({ model: "assets/geometry/spacesuit.js", callback: onLoadedCallback });
        },

        /**
         * Setup the SceneEditor
         */
        setupSceneEditor: function() {
            // Create a canvas for the sceneeditor
            var container = document.createElement('div');
            container.style.position = "absolute";
            container.style.top = "0px";
            document.body.appendChild(container);

            var sceneEditorCanvas = document.createElement('canvas');
            sceneEditorCanvas.width = 500;
            sceneEditorCanvas.height = 400;
            container.appendChild(sceneEditorCanvas);

            // Instantiate the SceneEditor
            var sceneEditor = new THREE.SceneEditor();
            sceneEditor.setCanvas(sceneEditorCanvas);
            sceneEditor.create();
            sceneEditor.setWorldOffset(this.camera.position);

            var defaultScale = 0.1;
            var axis = ['xy', 'xz', 'zy'],
                scales = [0.11, 0.11, 0.11];

            var xBuffer = 0,
                yBuffer = 0,
                xSpacing = 0;

            var plotterSize = 150;
            for (var i = 0; i < axis.length; i++) {
                var aScenePlotter = sceneEditor.addScenePlotter(axis[i], scales[i], plotterSize);
                aScenePlotter.setPosition(i * (plotterSize + xSpacing) + xBuffer, yBuffer);
            }

            this._sceneEditor = sceneEditor;
//            this.sceneEditor.setIsActive( false )
        },

        /**
         * Update and render scene
         * @param gameClock
         */
        update: function( gameClock ) {
            this.updateCameraPosition();
            this.updateSceneEditor();
            this._renderer.render( this._scene  , this._camera );
        },

        /**
         * Update camera
         */
        updateCameraPosition: function() {
            var aRadius = 1000;
            this._camera.update();

//            this._camera.position.x += Math.cos( this._mousePosition.x ) * aRadius;
            //noinspection JSSuspiciousNameCombinationInspection
            this._camera.position.y = Math.sin( this._mousePosition.y ) * aRadius + 100;
        },

        /**
         * Updates the _sceneEditor
         */
        updateSceneEditor: function() {
            if( !this._sceneEditor ) return;
            this._sceneEditor.update();
        },

        /**
         * Creates CubeGeometry based entity and adds it to the _scene
         * @param {Number} x
         * @param {Number} y
         * @param {Number} width
         * @param {Number} height
         * @param {Number} depth
         */
        createEntityView: function( x, y, width, height, depth ) {
            var geometry = new THREE.CubeGeometry( width, height, depth );
            var mesh = new THREE.Mesh( geometry, [new THREE.MeshLambertMaterial( {
                color: 0xFFFFFF, shading: THREE.SmoothShading,
                map : THREE.ImageUtils.loadTexture( "assets/images/game/floorred.png" )
            })] );
            mesh.dynamic = true;



            var id = ChuClone.GameViewController.prototype.GET_NEXT_VIEW_ID();
            mesh.name = id;
            mesh.position.x = x;
            mesh.position.y = y;
            mesh.position.z = 0;

            this.addObjectToScene( mesh );

            return mesh;
        },

        /**
         * Adds an entity
         * @param {THREE.Mesh} anEntityView
         */
        addObjectToScene: function( anEntityView ) {
            anEntityView.dynamic = true;

            if(this._sceneEditor)
                this._sceneEditor.startPlottingObject( anEntityView, THREE.SceneEditor.ScenePlotterDot.prototype.TYPES.SQUARE, false, false );

            this._scene.addObject( anEntityView );
        },

        /**
         * Removes an entity
         * @param {THREE.Mesh} anEntityView
         */
        removeObjectFromScene: function( anEntityView ) {

            if(this._sceneEditor)
                this._sceneEditor.stopPlottingObject( anEntityView, THREE.SceneEditor.ScenePlotterDot.prototype.TYPES.SQUARE, false, false );

            this._scene.removeObject( anEntityView );
        },

        ///// EVENTS
        /**
         * Convert to cartesian cordinates
         * @param {MouseEvent} event
         */
        onDocumentMouseMove: function( event ) {
            event.preventDefault();
            this._mousePosition.x = ( event.clientX / this.getDimensions().x ) * 2 - 1;
            this._mousePosition.y = - ( event.clientY / this.getDimensions().y ) * 2 + 1;
        },

        /**
         * Resize viewport and adjust camera
         * @param {Event} e
         */
        onResize: function( e ) {
            this._renderer.setSize( this.getDimensions().x, this.getDimensions().y );
            this._camera.aspect = this.getDimensions().x/this.getDimensions().y;
            this._camera.updateProjectionMatrix();
        },


        // Memory
        dealloc: function() {
            // TODO: Deallocate resources
        },

        ///// ACCESSORS
        /**
         * Sets the dimensions of the view
         * @param {Number} aWidth
         * @param {Number} aHeight
         * @return {THREE.Vector2}
         */
        setDimensions: function( aWidth, aHeight ){
            this._dimensions = new THREE.Vector2( aWidth, aHeight );
            return this._dimensions;
        },
        /**
         * Returns the gameview dimensions, or window.innerwidth, window.innerHeight if _isFullscreen is on
         * @return {THREE.Vector2}
         */
        getDimensions: function() {
            if( this._isFullScreen ) {
                return new THREE.Vector2( window.innerWidth, window.innerHeight );
            }
            
            return this._dimensions;
        },

        /**
         * @return {THREE.Camera}
         */
        getCamera: function() {
            return this._camera;
        },

        /**
         * @return {Number}
         */
        GET_NEXT_VIEW_ID: function() {
            return ChuClone.GameViewController.prototype.NEXT_VIEW_UUID++;
        }
    }
})();