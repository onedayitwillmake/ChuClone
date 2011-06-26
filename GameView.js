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
//		this.setupStats();
	};

	ChuClone.GameView.prototype = {

		// Properties
		stats				: null,				// Stats.js instance
        theta               : 0.2,
        camera              : null,

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

				this.camera.position.x = -5;
				this.camera.position.z = 375;

				scene = new THREE.Scene();
//                scene.addLight( new THREE.AmbientLight( 0x333333 ) );

            //hex, intensity, distance, castShadow
				var light = new THREE.PointLight( 0xffffff, 1.5, 1000 );
				light.position.x = 0;
				light.position.y = 1;
				light.position.z = 0;
				light.position.normalize();
				scene.addLight( light );
//                var light1 = new THREE.PointLight( 0xffffff, 10, 0 );
//                scene.addLight( light1 );

				var light = new THREE.PointLight( 0xffffff, 1 );
				light.position.x = - 1;
				light.position.y = - 1;
				light.position.z = - 1;
				light.position.normalize();
				scene.addLight( light );

                this.camera.position.y = 100;
				projector = new THREE.Projector();

				renderer = new THREE.WebGLRenderer();
				renderer.sortObjects = false;
				renderer.setSize( window.innerWidth, window.innerHeight );

				container.appendChild(renderer.domElement);

				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				container.appendChild( stats.domElement );

                var that = this;
				document.addEventListener( 'mousemove', function(e){that.onDocumentMouseMove(e)}, false );

            /*
            requestAnimationFrame( animate );

				render();
				stats.update();
             */
		},

		/**
		 * Updates our current view, passing along the current actual time (via Date().getTime());
		 * @param {Number} gameClockReal The current actual time, according to the game
		 */
		render: function( gameClockReal ) {
			var radius = 600;
//			var theta = 0;

            var s = 0;

            this.theta += 0.5;
//            this.camera.position.x = radius * Math.sin( this.theta * Math.PI / 360 ) + s;
//            this.camera.position.y = radius * Math.sin( this.theta * Math.PI / 360 );
//            this.camera.position.z = radius * Math.cos( this.theta * Math.PI / 360 ) + s;
//            var zero = new THREE.Vector3(Math.random() * 100, Math.random() * 100,0);
//            console.log(zero)


            // find intersections


            this.camera.update();

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

            renderer.render( scene, this.camera );

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
            var geometry = new THREE.CubeGeometry( width, height, depth );
            var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xffffff } ) );
            object.position.x = x;//i * 21;//i*100;//Math.random() * 800 - 400;
            object.position.y = y;//Math.random() * 800 - 400;
            object.position.z = 0;//10;// Math.random() * 800 - 400;
//            					object.rotation.x = ( Math.random() * 360 ) * Math.PI / 180;
//            					object.rotation.y = ( Math.random() * 360 ) * Math.PI / 180;
//            					object.rotation.z = ( Math.random() * 360 ) * Math.PI / 180;
            //					object.scale.x = Math.random() * 2 + 1;
            //					object.scale.y = Math.random() * 2 + 1;
            //					object.scale.z = Math.random() * 2 + 1;

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