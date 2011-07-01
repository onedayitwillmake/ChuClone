/**
File:
	GameView.js
Created By:
	Mario Gonzalez
Project:
	ChuClone
Abstract:
	This class controls the view for the game overall.
    It currently uses THREE.js to render the objects

Basic Usage:
 	this.view = new ChuClone.GameView();

    // Assuming you have a player  - call every frame
    this.view.camera.target.position = this.player.view.position;
    this.view.camera.position.x = this.player.view.position.x - 700;
    this.view.render();
Version:
	1.0
*/
(function(){
    var container, stats;
    var scene, projector, renderer;

    var mouse = { x: 0, y: 0 }, INTERSECTED;

	ChuClone.GameView = function() {
		this.setupThreeJS();
//        this.setupSceneEditor();

        // Add it to the scene plotter, specifying SQUARE as 2d representation
//        this.sceneEditor.startPlottingObject( this.camera, THREE.SceneEditor.ScenePlotterDot.prototype.TYPES.SQUARE, false, false );
//        this.sceneEditor.startPlottingObject( this.light1, THREE.SceneEditor.ScenePlotterDot.prototype.TYPES.SQUARE, false, false );
//		this.setupStats();
	};

	ChuClone.GameView.prototype = {

		// Properties
		stats				: null,				// Stats.js instance
        theta               : 0.2,
        camera              : null,
        sceneEditor         : null,

        light1              : null,

        /**
         * @type {Number}
         */
        NEXT_VIEW_ID        : 0,

		// Methods
		setupThreeJS: function() {
            container = document.createElement( 'div' );
			document.body.appendChild( container );

			var info = document.createElement( 'div' );
			info.style.position = 'absolute';
			info.style.top = '10px';
			info.style.width = '100%';
			info.style.textAlign = 'center';
//				info.innerHTML = '<a href="http://github.com/mrdoob/three.js" target="_blank">three.js</a> webgl - interactive cubes';
			container.appendChild( info );

			this.camera = new THREE.Camera( 70, window.innerWidth / window.innerHeight, 1, 30000 );

			this.camera.position.x = 0;
			this.camera.position.y = 0;
			this.camera.position.z = 1000;
			this.camera.name = "camera";

			scene = new THREE.Scene();
			scene.addLight( new THREE.AmbientLight(0x608090) );

		//hex, intensity, distance, castShadow
//				this.light1 = new THREE.PointLight( 0xFFFFFF, 1, 25000 );
//                this.light1.name = "light1";
//				this.light1.position.x = 0;
//				this.light1.position.y = 20;
//				this.light1.position.z = -100;
//				scene.addLight( this.light1 );
			this.light1 = new THREE.DirectionalLight( 0x608090, 1.6, 0, true );
			this.light1.position.set( 0, 2, 1 );
			scene.addLight( this.light1 );

//			var light = new THREE.DirectionalLight( 0xffffff, 1 );
//			light.position.set( -1, 0, 0.5 );
//			scene.addLight( light );

			scene.fog = new THREE.FogExp2( 0x000000, 0.00001 );
//                var   light1 = new THREE.PointL	ight( 0xffffff, 10, 0 );
//                scene.addLight( light1 );

//				var light = new THREE.PointLight( 0xffffff, 1 );
//				light.position.x = - 1;
//				light.position.y = - 1;
//				light.position.z = - 1;
//				light.position.normalize();
//				scene.addLight( light );


			this.camera.position.y = 100;
			projector = new THREE.Projector();

			renderer = new THREE.WebGLRenderer();
			renderer.sortObjects = false;
			renderer.setClearColor(new THREE.Color(0xFFFFFF), 1);
			renderer.setSize( window.innerWidth, window.innerHeight );

			container.appendChild(renderer.domElement);


			this.setupBirds();

			var that = this;
            window.addEventListener( 'resize', function(e) { that.onResize(e); }, false);
			document.addEventListener( 'mousemove', function(e){ that.onDocumentMouseMove(e)}, false );
		},

		setupBirds: function() {
			this.birds = [];
			var range = 600;

			for(var i = 0; i < 100; i++ ) {
				var bird = this.birds[ i ] = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( {
					color:Math.random() * 0x222222 + 0xDDDDDD
				} ) );
				bird.phase = Math.floor( Math.random() * 62.83 );
				bird.position = new THREE.Vector3( Math.random() * range, Math.random() * range, (Math.random()*2-1) * range*2 );
				bird.doubleSided = true;
//                bird.dynamic = true;
				bird.scale.x = bird.scale.y = bird.scale.z = (Math.random()) * 5 + 5;
				scene.addObject( bird );
			}
		},

        setupSceneEditor: function() {

            // Create a canvas for the sceneeditor
            var container = document.createElement('div');
            container.style.position = "absolute";
            container.style.top = "0px";
            document.body.appendChild(container);

            var sceneEditorCanvas = document.createElement('canvas');
            container.appendChild(sceneEditorCanvas);

            sceneEditorCanvas.width = 500;
            sceneEditorCanvas.height = 400;


            // Instantiate the sceneeditor
            var sceneEditor = new THREE.SceneEditor();
            sceneEditor.setCanvas( sceneEditorCanvas );
            sceneEditor.create();
            sceneEditor.setWorldOffset( this.camera.position );

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

            this.sceneEditor = sceneEditor;
//            this.sceneEditor.setIsActive( false )
        },

		/**
		 * Updates our current view, passing along the current actual time (via Date().getTime());
		 * @param {Number} gameClockReal The current actual time, according to the game
		 */
		render: function( gameClockReal ) {
			var radius = 1000;
//			var theta = 0;

            this.theta += 1;
            var offset = 0;
            this.camera.position.x += mouse.x * 1000;//radius * Math.sin( this.theta * Math.PI / 360 );
            this.camera.position.y = Math.sin(mouse.y) * 1000;//radius * Math.sin( this.theta * Math.PI / 360 );
//            this.camera.position.z = radius * Math.cos( this.theta * Math.PI / 360 );
//            var zero = new THREE.Vector3(Math.random() * 100, Math.random() * 100,0);
//            console.log(zero)

//            this.light1.position.x -= (this.light1.position.x - this.camera.position.x - 1000) * 0.09;
//            this.light1.position.z = this.camera.position.z ;

			this.renderBirds();
            this.camera.update();
            renderer.render( scene, this.camera );

            if(this.stats) this.stats.update();
            if(this.sceneEditor) {
//                if(this.sceneEditor._activePlotter && this.sceneEditor._activePlotter._draggedDot)
//                    console.log( this.sceneEditor._activePlotter._draggedDot._delegate )
                this.sceneEditor.update();
            }

            if(this.first) {
//                console.log(this.first)
            }
		},

		renderBirds: function() {
			for ( var i = 0, il = this.birds.length; i < il; i++ ) {
					var bird = this.birds[ i ];

					var color = bird.materials[ 0 ].color;
//					color.r = color.g = color.b = ( 500 - bird.position.z ) / 1000;
//					color.updateHex();

//					bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
//					bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );
//					bird.position.x = this.camera.position.x;

//					bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
					bird.geometry.vertices[ 5 ].position.y = bird.geometry.vertices[ 4 ].position.y = Math.sin( Math.random() ) * 5;
				}
		},

        findIntersections: function() {
            var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
            projector.unprojectVector( vector, this.camera );

            var ray = new THREE.Ray( this.camera.position, vector.subSelf( this.camera.position ).normalize() );

            var intersects = ray.intersectScene( scene );

            if ( intersects.length > 0 ) {

                if ( INTERSECTED != intersects[ 0 ].object ) {

                    if ( INTERSECTED ) INTERSECTED.materials[ 0 ].color.setHex( INTERSECTED.currentHex );

                    INTERSECTED = intersects[ 0 ].object;
                    INTERSECTED.currentHex = INTERSECTED.materials[ 0 ].color.hex;
                    INTERSECTED.materials[ 0 ].color.setHex( 0xff0000 );

                }

            } else {

                if ( INTERSECTED ) INTERSECTED.materials[ 0 ].color.setHex( INTERSECTED.currentHex );

                INTERSECTED = null;

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

        createEntityView: function( x, y, width, height, depth ) {
            var geometry = new THREE.CubeGeometry( 1, 1, depth );
            var object = new THREE.Mesh( geometry, [new THREE.MeshLambertMaterial( {
				color: 0xFFFFFF, shading: THREE.SmoothShading,
				map : THREE.ImageUtils.loadTexture( "lvl.png" )
			})] );



            var id = ChuClone.GameView.prototype.GET_NEXT_VIEW_ID();

            object.name = id;
            object.position.x = x;
            object.position.y = y;
            object.position.z = 0;
            object.scale.x = width;
            object.scale.y = height;

            if(this.sceneEditor)
                this.sceneEditor.startPlottingObject( object, THREE.SceneEditor.ScenePlotterDot.prototype.TYPES.SQUARE, false, false );

            if(id == 0) {
                this.first = object;
            }
            return object;
        },

		addEntity: function( anEntityView ) {
            scene.addObject( anEntityView );
		},

		removeEntity: function( anEntityView ) {
			scene.removeObject( anEntityView );
		},

        /**
         * Convert to cartesian cordinates
         * @param {MouseEvent} event
         */
        onDocumentMouseMove: function( event ) {
            event.preventDefault();
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        },

        /**
         * Resize viewport and adjust camera
         * @param {Event} e
         */
        onResize: function( e ) {
            console.log("RESIZE")
            renderer.setSize( window.innerWidth, window.innerHeight );
            this.camera.aspect = window.innerWidth/window.innerHeight;
            this.camera.updateProjectionMatrix();
        },


		// Memory
		dealloc: function() {
			this.director.destroy();
		},

        /**
         * @return {Number}
         */
        GET_NEXT_VIEW_ID: function() {
            return ChuClone.GameView.prototype.NEXT_VIEW_ID++;
        }
	};
})();