/**
 File:
    CameraGUI.js
 Created By:
    Mario Gonzalez - mariogonzalez@gmail.com
 Project:
    ChuClone
 Abstract:
    This class is just a singleton proxy for an event emitter instnace
 Basic Usage:
     // Assumes all files are loaded
    var game = new ChuClone.ChuCloneGame();
 Version:
    1.0

 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";
    ChuClone.namespace("ChuClone.editor.CameraGUI");
    ChuClone.editor.CameraGUI = function( aCamera ) {
        this._camera = aCamera;
        this.setupGUI();
        this.setupEvents();
    };

    ChuClone.editor.CameraGUI.prototype = {
        /**
         * @type {THREE.Camera}
         */
        _camera: null,

        /**
         * @type {ChuClone.GameEntity}
         */
        _player: null,

        /**
         * @type {Box2D.Dynamics.b2DebugDraw}
         */
        _debugDraw: null,

        /**
         * @type {DAT.GUI}
         */
        _gui    : null,
        
        /**
         * @type {Array}
         */
        _controls: [],

		/**
		 * @type {Boolean}
		 */
		_isFullScreen : false,

		/**
         * We modify this not the b2Body directly
         */
        _propProxy          : {x: 5, y: 5, z: 3, radius: new THREE.Vector3(1000, 1000, 3000), fullscreen: false},

		// Camera type
        _type   : 0,
        _camTypes: [null, ChuClone.components.camera.CameraFollowEditorComponent, ChuClone.components.camera.CameraFollowPlayerComponent],

        setupGUI: function() {

            var that = this;
			this._fullScreen = false;//ChuClone.editor.WorldEditor.getInstance().getWorldController().getViewController().getFullscreen();

            this._gui = new DAT.GUI({width: ChuClone.model.Constants.EDITOR.PANEL_WIDTH});
            this._gui.name("Camera");
            this._gui.autoListen = false;

			// Cam type
            this._controls['type'] = this._gui.add(this, '_type');
            this._controls['type'].options( {"None": 0, "Follow Editor": 1, "Follow Player": 2} );
            this._controls['type'].onChange( function() {
                var selected = this.domElement.lastChild.selectedIndex;

                // Remove focus from the elemnt otherwise
                document.getElementsByTagName("canvas")[0].focus();
                document.getElementsByTagName("canvas")[1].focus();
                that.onCamTypeChange( selected );
            });

			// Radius component
			var maxRadius = 7000;
			this._controls['radiusX'] = this._gui.add(this._propProxy.radius, 'x').onChange( function( aValue ) { that.onRadiusChange(this); }).min(-maxRadius).max(maxRadius);
			this._controls['radiusY'] = this._gui.add(this._propProxy.radius, 'y').onChange( function( aValue ) { that.onRadiusChange(this); }).min(-maxRadius/2).max(maxRadius/2);
			this._controls['radiusZ'] = this._gui.add(this._propProxy.radius, 'z').onChange( function( aValue ) { that.onRadiusChange(this); }).min(0).max(maxRadius*2);


			this.setupFullscreenToggle();
          	this._gui.close();
            this._gui.open();
        },

		/**
		 * Sets up callbacks for events - PlayerCreated, 'LevelDestroyed'
		 */
		 setupEvents: function() {
            var that = this;

			// PLAYER CREATED
            ChuClone.Events.Dispatcher.addListener(ChuClone.components.player.CharacterControllerComponent.prototype.EVENTS.CREATED, function( aPlayer ) {
                that._player = aPlayer;
            });
			// Player destroyed
			ChuClone.Events.Dispatcher.addListener(ChuClone.components.player.CharacterControllerComponent.prototype.EVENTS.REMOVED, function( aPlayer ) {
                if( aPlayer == that._player ) that._player = null;
            });

            // LEVEL DESTROYED
            ChuClone.Events.Dispatcher.addListener(ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_DESTROYED, function( aLevelModel ) {
                that._controls['type'].domElement.childNodes[1].selectedIndex = 0;
            });

			// LEVEL CREATED
            ChuClone.Events.Dispatcher.addListener(ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_CREATED, function( aLevelModel ) {
				that._controls['type'].domElement.childNodes[1].selectedIndex = 1;
				that.onCamTypeChange( 1 );
            });
        },


		/**
		 * Wraps callback for fullscreen toggle
		 */
		setupFullscreenToggle: function() {

			// Store styles
            ChuClone.utils.StyleMemoizer.rememberStyle( "flash_notice" );
            ChuClone.utils.StyleMemoizer.rememberStyle( "editorContainer" );
			ChuClone.utils.StyleMemoizer.rememberStyle( "levelName" );
			ChuClone.utils.StyleMemoizer.rememberStyle( "HUDTime" );

			//
			var that = this;
			this._controls['fullscreen'] = this._gui.add(this._propProxy, 'fullscreen').name("Fullscreen").onChange(function( aValue ) {
				ChuClone.editor.WorldEditor.getInstance().getViewController().setFullscreen(aValue);

				var editorContainer = document.getElementById("editorContainer");
            	var levelName = document.getElementById("levelName");
				var hudTime = document.getElementById("HUDTime");
				var flashNotice = document.getElementById("flash_notice");

				if (aValue) {
					var editorLeft = Math.round(window.innerWidth/2 - editorContainer.clientWidth/2);
					editorContainer.style.position = 'absolute'
					editorContainer.style.top = window.innerHeight - ChuClone.model.Constants.GAME_HEIGHT - 10 + "px"
					editorContainer.style.left =  editorLeft + "px";

					levelName.style.position = 'absolute'
					levelName.style.width = (60 * 4) + 'px'
					levelName.style.top = window.innerHeight - levelName.offsetHeight - 6 + "px"
					levelName.style.left = editorLeft - levelName.clientWidth - 25 + "px";

					hudTime.style.position = 'absolute'
					hudTime.style.top = window.innerHeight - levelName.offsetHeight - hudTime.offsetHeight - 10 + "px"
					hudTime.style.left = editorLeft - hudTime.offsetWidth - 33 + "px";

					flashNotice.style['z-index'] = 1;
					flashNotice.style.backgroundColor = 	"#FFFFFF";
					flashNotice.style.opacity = 0.75;
					flashNotice.style.top = parseInt(editorContainer.style.top) - flashNotice.clientHeight - 10 + "px"
				} else {
					ChuClone.utils.StyleMemoizer.restoreStyle( "flash_notice" );
					ChuClone.utils.StyleMemoizer.restoreStyle( 'editorContainer' );
					ChuClone.utils.StyleMemoizer.restoreStyle( 'levelName' );
					ChuClone.utils.StyleMemoizer.restoreStyle( 'HUDTime' );
				}
			});
		},


		/**
		 * Called when the camera type has been changed
		 * @param {Number} selectedIndex Drop down item index
		 */
        onCamTypeChange: function( selectedIndex ) {

            this._camera.removeAllComponents();

			// NULL was selected
            if( !this._camTypes[selectedIndex] ) return;

            /**
             * @type {ChuClone.components.BaseComponent}
             */
            var component = new this._camTypes[selectedIndex];
            this._camera.addComponentAndExecute( component );

            if( this._camTypes[selectedIndex] == ChuClone.components.camera.CameraFollowEditorComponent ) {
                component.setDebugDraw( this._debugDraw );
            } else if ( this._camTypes[selectedIndex] == ChuClone.components.camera.CameraFollowPlayerComponent ) {
				component._damping = 0.25;
                component.setPlayer( this._player );
            }

			// Add radius component
			var focusComponent = new ChuClone.components.camera.CameraFocusRadiusComponent();
			this._camera.addComponentAndExecute( focusComponent );
			focusComponent.getRadius().x = this._propProxy.radius.x;
			focusComponent.getRadius().y = this._propProxy.radius.y;
			focusComponent.getRadius().z = this._propProxy.radius.z;

			if( this._camTypes[selectedIndex] == ChuClone.components.camera.CameraFollowPlayerComponent ) {
				this._controls['radiusX'].setValue(500);
				this._controls['radiusY'].setValue(500);
				this._controls['radiusZ'].setValue(4500);
			}

            if( this._player ) {
                this._camera.position = this._player.getView().position.clone();
            }
        },

		/**
		 * Modifies the radius for the CameraFocusRadiusComponent
		 * @param {DAT.GUI.Controller} guiController Controller that called this function
		 */
		onRadiusChange: function( guiController ) {
			var focusRadiusComponent = this._camera.getComponentWithName( ChuClone.components.camera.CameraFocusRadiusComponent.prototype.displayName );
				focusRadiusComponent.getRadius()[guiController.propertyName] = guiController.getValue();
		},

        /**
         * Deallocate resources
         */
        dealloc: function() {
            this._camera.removeAllComponents();
            this._camera.components = null;
            this._camera = null;
        },

        /**
         * @param {Box2D.Dynamics.b2DebugDraw} aDebugDraw
         */
        setDebugDraw: function( aDebugDraw ) {
            this._debugDraw = aDebugDraw
        }
    }
})();