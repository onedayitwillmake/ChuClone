/**
File:
	AbstractServerGame.js
Created By:
	Mario Gonzalez
Project:
	RealtimeMultiplayerNodeJS
Abstract:
	This class is the base Game controller in RealtimeMultiplayerGame on the server side.
 	It provides things such as dropping players, and contains a ServerNetChannel
Basic Usage:
 	[This class is not instantiated! - below is an example of using this class by extending it]

 	(function(){
		MyGameClass = function() {
			return this;
 		}

		RealtimeMultiplayerGame.extend(MyGameClass, RealtimeMultiplayerGame.AbstractServerGame, null);
	};
Version:
	1.0
*/
(function(){
    var container, stats;
    var scene, projector, renderer;

    var mouse = { x: 0, y: 0 }, INTERSECTED;

	ChuClone.GameView = function() {
		this.setupThreeJS();
        this.setupSceneEditor();

        // Add it to the scene plotter, specifying SQUARE as 2d representation
        this.sceneEditor.startPlottingObject( this.camera, THREE.SceneEditor.ScenePlotterDot.prototype.TYPES.SQUARE, false, false );
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

				this.camera = new THREE.Camera( 70, window.innerWidth / window.innerHeight, 1, 10000 );

				this.camera.position.x = 0;
				this.camera.position.y = 0;
				this.camera.position.z = 1000;
                this.camera.name = "camera";

				scene = new THREE.Scene();
                scene.addLight( new THREE.AmbientLight( 0xFFFFFF) );

            //hex, intensity, distance, castShadow
				this.light1 = new THREE.PointLight( 0xffffff, 1.5, 0 );
                this.light1.name = "light1";
				this.light1.position.x = 0;
				this.light1.position.y = 318;
				this.light1.position.z = 90;
				scene.addLight( this.light1 );
//                var   light1 = new THREE.PointLight( 0xffffff, 10, 0 );
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
				renderer.setSize( window.innerWidth, window.innerHeight );

				container.appendChild(renderer.domElement);

                var that = this;
				document.addEventListener( 'mousemove', function(e){that.onDocumentMouseMove(e)}, false );

            /*
            requestAnimationFrame( animate );

				render();
				stats.update();
             */
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
			var radius = 300;
//			var theta = 0;

            this.theta += 1;
            var offset = 0;
//            this.camera.position.x = radius * Math.sin( this.theta * Math.PI / 360 );
//            this.camera.position.y = radius * Math.sin( this.theta * Math.PI / 360  * 2);
//            this.camera.position.z = radius * Math.cos( this.theta * Math.PI / 360 );
//            var zero = new THREE.Vector3(Math.random() * 100, Math.random() * 100,0);
//            console.log(zero)

            this.light1.position.x = this.camera.position.x;
            this.light1.position.z = this.camera.position.z ;

            this.camera.update();
            renderer.render( scene, this.camera );

            if(this.stats) this.stats.update();
            if(this.sceneEditor) {
//                if(this.sceneEditor._activePlotter && this.sceneEditor._activePlotter._draggedDot)
//                    console.log( this.sceneEditor._activePlotter._draggedDot._delegate )
                this.sceneEditor.update();
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

        id: 0,
        createEntityView: function( x, y, width, height, depth ) {
            var geometry = new THREE.CubeGeometry( width, height, depth );
            var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading } ) );
            object.name = ++this.id;
            object.position.x = x;//i * 21;//i*100;//Math.random() * 800 - 400;
            object.position.y = y;//Math.random() * 800 - 400;
            object.position.z = 0;//10;// Math.random() * 800 - 400;
//            					object.rotation.x = ( Math.random() * 360 ) * Math.PI / 180;
//            					object.rotation.y = ( Math.random() * 360 ) * Math.PI / 180;
//            					object.rotation.z = ( Math.random() * 360 ) * Math.PI / 180;

//            if(this.sceneEditor) this.sceneEditor.startPlottingObject( object, THREE.SceneEditor.ScenePlotterDot.prototype.TYPES.SQUARE, false, false );

            return object;
        },

		addEntity: function( anEntityView ) {
            scene.addObject( anEntityView );
		},

		removeEntity: function( anEntityView ) {
			scene.removeObject( anEntityView );
		},

        onDocumentMouseMove: function( event ) {

            event.preventDefault();

            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        },

		/**
		 * Insert the CAATDirector canvas into an HTMLElement
		 * @param {String} id An HTMLElement id
		 */
		insertIntoHTMLElementWithId: function( id ) {
			document.getElementById(id).appendChild( this.caatDirector.canvas);
		},

		// Memory
		dealloc: function() {
			this.director.destroy();
		}
	};
})();