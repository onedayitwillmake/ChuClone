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
    var postprocessing = { enabled : false };


    function initPostprocessing() {

        postprocessing.scene = new THREE.Scene();

        postprocessing.camera = new THREE.Camera();
        postprocessing.camera.projectionMatrix = THREE.Matrix4.makeOrtho( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
        postprocessing.camera.position.z = 100;

        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
        postprocessing.rtTexture1 = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );
        postprocessing.rtTexture2 = new THREE.WebGLRenderTarget( 512, 512, pars );
        postprocessing.rtTexture3 = new THREE.WebGLRenderTarget( 512, 512, pars );

        var screen_shader = THREE.ShaderUtils.lib["screen"];
        var screen_uniforms = THREE.UniformsUtils.clone( screen_shader.uniforms );

        screen_uniforms["tDiffuse"].texture = postprocessing.rtTexture1;
        screen_uniforms["opacity"].value = 1.0;

        postprocessing.materialScreen = new THREE.MeshShaderMaterial( {

            uniforms: screen_uniforms,
            vertexShader: screen_shader.vertexShader,
            fragmentShader: screen_shader.fragmentShader,
            blending: THREE.AdditiveBlending,
            transparent: true

        } );

        var convolution_shader = THREE.ShaderUtils.lib["convolution"];
        var convolution_uniforms = THREE.UniformsUtils.clone( convolution_shader.uniforms );

        var blurAmount = 0.001;
postprocessing.blurx = new THREE.Vector2( blurAmount, 0.0 ),
				postprocessing.blury = new THREE.Vector2( 0.0, blurAmount );

        convolution_uniforms["tDiffuse"].texture = postprocessing.rtTexture1;
        convolution_uniforms["uImageIncrement"].value = postprocessing.blurx;
        convolution_uniforms["cKernel"].value = THREE.ShaderUtils.buildKernel( 4.0 );

        postprocessing.materialConvolution = new THREE.MeshShaderMaterial( {

            uniforms: convolution_uniforms,
            vertexShader:   "#define KERNEL_SIZE 25.0\n" + convolution_shader.vertexShader,
            fragmentShader: "#define KERNEL_SIZE 25\n"   + convolution_shader.fragmentShader

        } );


        var film_shader = THREE.ShaderUtils.lib["film"];
        var film_uniforms = THREE.UniformsUtils.clone( film_shader.uniforms );

        film_uniforms["tDiffuse"].texture = postprocessing.rtTexture1;

        /*
        effect.materialFilm.uniforms.grayscale.value = 0;
            effect.materialFilm.uniforms.nIntensity.value = 0.5;
            effect.materialFilm.uniforms.sIntensity.value = 0.5;
            effect.materialFilm.uniforms.sCount.value = 1448;
         */
        postprocessing.materialFilm = new THREE.MeshShaderMaterial( { uniforms: film_uniforms, vertexShader: film_shader.vertexShader, fragmentShader: film_shader.fragmentShader } );
        postprocessing.materialFilm.uniforms.grayscale.value = 0;
        postprocessing.materialFilm.uniforms.nIntensity.value = 0;
        postprocessing.materialFilm.uniforms.sIntensity.value = 0;
        postprocessing.materialFilm.uniforms.sCount.value = 1000;

        postprocessing.quad = new THREE.Mesh( new THREE.PlaneGeometry( window.innerWidth, window.innerHeight ), postprocessing.materialConvolution );
        postprocessing.quad.position.z = - 500;
        postprocessing.scene.addObject( postprocessing.quad );

    }


    ChuClone.namespace("ChuClone");
    ChuClone.GameViewController = function() {
        this.setDimensions( ChuClone.model.Constants.GAME_WIDTH, ChuClone.model.Constants.GAME_HEIGHT );
        this.setupContainer();
        this.setupScene();
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupEvents();
//        this.setupBackgroundParticleManager();
//        this.setupBloom();
        this.setupStats();
        this.onSetupComplete();

        ChuClone.GameViewController.INSTANCE = this;
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

            ChuClone.DOM_ELEMENT = this._domElement;
			ChuClone.DOM_ELEMENT.tabIndex = 1;
        },

        /**
         * Setup the THREE.Scene used to hold our objects
         */
        setupScene: function() {
            this._scene = new THREE.Scene();
            //this._scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.00005 );
        },

        /**
         * Setup the WebGLRenderer that will draw our scene
         */
        setupRenderer: function() {
            this._renderer = new THREE.WebGLRenderer({antialias: true});
            initPostprocessing();
            this._renderer.autoClear = false;
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
            this._camera = new THREE.Camera( 65, 900/400, 1, 22000 );
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
//            this._domElement.addEventListener( 'mousemove', function(e){ that.onDocumentMouseMove(e)}, false );
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
         * Creates a Stats.js instance and adds it to the page
         */
        setupStats: function() {
            var container = document.createElement( 'div' );
            this.stats = new Stats();
            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.top = '0px';
            container.appendChild( this.stats.domElement );
            document.body.appendChild( container );
        },

        setupBloom: function() {
            var effect = postprocessing1;
            var SCREEN_WIDTH = this.getDimensions().x;
            var SCREEN_HEIGHT = this.getDimensions().y;

            effect.type = "bloomnoise";

            effect.scene = new THREE.Scene();

            effect.camera = new THREE.Camera();
            effect.camera.projectionMatrix = THREE.Matrix4.makeOrtho(SCREEN_WIDTH / - 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / - 2, -10000, 10000);
            effect.camera.position.z = 100;

            var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

            effect.rtTexture1 = new THREE.WebGLRenderTarget(SCREEN_WIDTH, SCREEN_HEIGHT, pars);
            effect.rtTexture2 = new THREE.WebGLRenderTarget(256, 512, pars);
            effect.rtTexture3 = new THREE.WebGLRenderTarget(512, 256, pars);

            var screen_shader = THREE.ShaderUtils.lib["screen"];
            var screen_uniforms = THREE.UniformsUtils.clone(screen_shader.uniforms);

            screen_uniforms["tDiffuse"].texture = effect.rtTexture3;
            screen_uniforms["opacity"].value = 0.0;

            effect.materialScreen = new THREE.MeshShaderMaterial({

                uniforms: screen_uniforms,
                vertexShader: screen_shader.vertexShader,
                fragmentShader: screen_shader.fragmentShader,
                blending: THREE.AdditiveBlending,
                transparent: true

            });

            var convolution_shader = THREE.ShaderUtils.lib["convolution"];
            var convolution_uniforms = THREE.UniformsUtils.clone(convolution_shader.uniforms);

            //effect.blurx = new THREE.Vector2(0.001953125, 0.0),
            //    effect.blury = new THREE.Vector2(0.0, 0.001953125);

            effect.blurx = new THREE.Vector2(0.0, 0.0),
            effect.blury = new THREE.Vector2(0.0, 0.0000);

            convolution_uniforms["tDiffuse"].texture = effect.rtTexture1;
            convolution_uniforms["uImageIncrement"].value = effect.blurx;
            convolution_uniforms["cKernel"].value = THREE.ShaderUtils.buildKernel(4.0);

            effect.materialConvolution = new THREE.MeshShaderMaterial({

                uniforms: convolution_uniforms,
                vertexShader:   "#define KERNEL_SIZE 12.0\n" + convolution_shader.vertexShader,
                fragmentShader: "#define KERNEL_SIZE 12\n" + convolution_shader.fragmentShader

            });

            var film_shader = THREE.ShaderUtils.lib["film"];
            var film_uniforms = THREE.UniformsUtils.clone(film_shader.uniforms);

            film_uniforms["tDiffuse"].texture = effect.rtTexture1;

            effect.materialFilm = new THREE.MeshShaderMaterial({ uniforms: film_uniforms, vertexShader: film_shader.vertexShader, fragmentShader: film_shader.fragmentShader });
            effect.materialFilm.uniforms.grayscale.value = 0;
            effect.materialFilm.uniforms.nIntensity.value = 0.5;
            effect.materialFilm.uniforms.sIntensity.value = 0.5;
            effect.materialFilm.uniforms.sCount.value = 1448;

            effect.quad = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT), effect.materialConvolution);
            effect.quad.position.z = -500;
            effect.scene.addObject(effect.quad);
        },


        /**
         * Called internally after all individual setup functions have been called.
         * Allows a chance for final initialization safely assuming various properties exist in correct state
         */
        onSetupComplete: function() {
			this._domElement.firstChild.focus();
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

            //this._renderer.render( this._scene  , this._camera );
			if( this.stats )
            	this.stats.update();

           this.render();

        },

        render: function() {
            var renderer = this._renderer;
            var camera = this._camera;
            var scene = this._scene;
            if (postprocessing.enabled) {

                renderer.clear();

                // Render scene into texture

                renderer.render(scene, camera, postprocessing.rtTexture1, true);

                // Render quad with blured scene into texture (convolution pass 1)

                postprocessing.quad.materials = [ postprocessing.materialConvolution ];

                postprocessing.materialConvolution.uniforms.tDiffuse.texture = postprocessing.rtTexture1;
                postprocessing.materialConvolution.uniforms.uImageIncrement.value = postprocessing.blurx;

                renderer.render(postprocessing.scene, postprocessing.camera, postprocessing.rtTexture2, true);

                // Render quad with blured scene into texture (convolution pass 2)

                postprocessing.materialConvolution.uniforms.tDiffuse.texture = postprocessing.rtTexture2;
                postprocessing.materialConvolution.uniforms.uImageIncrement.value = postprocessing.blury;

                renderer.render(postprocessing.scene, postprocessing.camera, postprocessing.rtTexture3, true);

                // Render original scene with superimposed blur to texture

                postprocessing.quad.materials = [ postprocessing.materialScreen ];

                postprocessing.materialScreen.uniforms.tDiffuse.texture = postprocessing.rtTexture3;
                postprocessing.materialScreen.uniforms.opacity.value = 1.25;

                renderer.render(postprocessing.scene, postprocessing.camera, postprocessing.rtTexture1, false);

                // Render to screen

                postprocessing.materialFilm.uniforms.time.value += 0.01;
                postprocessing.quad.materials = [ postprocessing.materialFilm ];

                postprocessing.materialScreen.uniforms.tDiffuse.texture = postprocessing.rtTexture1;
                renderer.render(postprocessing.scene, postprocessing.camera);

            } else {

                renderer.clear();
                renderer.render(scene, camera);

            }
        },

        /**
         * Update camera
         */
        updateCameraPosition: function() {
            var aRadius = 1000;
            this._camera.update();

//            this._camera.position.x += Math.cos( this._mousePosition.x ) * aRadius;
            //noinspection JSSuspiciousNameCombinationInspection
//            this._camera.position.y = Math.sin( this._mousePosition.y ) * aRadius + 100;
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
                color: 0xFFFFFF,
                shading: THREE.SmoothShading,
                map : ChuClone.utils.TextureUtils.GET_TEXTURE( ChuClone.model.Constants.SERVER.ASSET_PREFIX + "assets/images/game/floor.png" )
            })] );
            mesh.dynamic = false;



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
                return new THREE.Vector2( window.innerWidth, window.innerHeight-10 );
            }

            return this._dimensions;
        },
		/**
		 * @return {Boolean}
		 */
		getFullscreen: function() { return this._isFullScreen; },
		/**
		 * @type {Boolean}
		 */
		setFullscreen: function( aValue ) {
			this._isFullScreen = aValue;

            if( this._isFullScreen ) {
                this._domElement.style.position = "absolute";
                this._domElement.style.top = 0;
                this._domElement.style.left = 0;
                
            } else {
                this._domElement.style.top = "";
                this._domElement.style.left = "";
                this._domElement.style.position = "relative";
            }
			this._renderer.setSize( this.getDimensions().x, this.getDimensions().y );
			this.onResize();
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
    };
})();