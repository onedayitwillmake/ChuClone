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
			this._gui.add(this._propProxy.radius, 'x').onChange( function( aValue ) { that.onRadiusChange(this); }).min(-maxRadius).max(maxRadius);
			this._gui.add(this._propProxy.radius, 'y').onChange( function( aValue ) { that.onRadiusChange(this); }).min(-maxRadius/2).max(maxRadius/2);
			this._gui.add(this._propProxy.radius, 'z').onChange( function( aValue ) { that.onRadiusChange(this); }).min(0).max(maxRadius*2);


            var editorContainer = document.getElementById("editorContainer");
            var levelName = document.getElementById("levelName");
            var hudTime = document.getElementById("HUDTime");

            this._preFullscreen = {};
            this._preFullscreen['editorContainer'] = window.getComputedStyle(editorContainer);
            this._preFullscreen['levelName'] = window.getComputedStyle(levelName);
            this._preFullscreen['hudTime'] = window.getComputedStyle(hudTime);

			// Fullscreen
			this._controls['fullscreen'] = this._gui.add(this._propProxy, 'fullscreen').name("Fullscreen").onChange(function( aValue ) {
				ChuClone.editor.WorldEditor.getInstance().getViewController().setFullscreen( aValue );



                if(aValue) {
                    
//                    editorContainer.style.position = 'absolute'
//                    editorContainer.style.top = window.innerHeight - ChuClone.model.Constants.GAME_HEIGHT - 10   + "px"
//                    editorContainer.style.left = 30 + "px";
//
//                    levelName.style.position = 'absolute'
//                    levelName.style.width = (60*4) + 'px'
//                    levelName.style.top = parseInt(editorContainer.style.top) - levelName.offsetHeight + "px"
//                    levelName.style.left = "10px";
//
//                    hudTime.style.position = 'absolute'
//                    hudTime.style.top = parseInt(editorContainer.style.top) - (hudTime.clientHeight) - 2 + "px"
//                    hudTime.style.left = levelName.offsetWidth + 5 + "px";
                } else {
                    editorContainer.style.position = that._preFullscreen['editorContainer'].getPropertyValue("position");
                    editorContainer.style.position
                    editorContainer.style.position

//                    editorContainer.style.top = "" = editorContainer.style.left = "" = levelName.style.top = levelName.style.left = hudTime.style.top = hudTime.style.left = "";
                }

                console.log( window.getComputedStyle(editorContainer, null))
//				ChuClone.editor.WorldEditor.getInstance().getWorldController().g.setFullscreen( aValue );
			});

            this._gui.close();
            this._gui.open();
        },

        

		/**
		 * Called when the camera type has been changed
		 * @param {Number} selectedIndex Drop down item index
		 */
        onCamTypeChange: function( selectedIndex ) {

			// Reset camera
//			for(var i = 0; i < this._camTypes.length; i++) {
//				if(!this._camTypes[i]) continue;
//				this._camera.removeComponentWithName( this._camTypes[i].prototype.displayName );
//			}
            this._camera.removeAllComponents();

			// NULL was selected
            if( !this._camTypes[selectedIndex] ) return;

            /**
             * @type {ChuClone.components.BaseComponent}
             */
            var component = new this._camTypes[selectedIndex];
            this._camera.addComponentAndExecute( component );

            if( selectedIndex == 1 ) {
                component.setDebugDraw( this._debugDraw );
            } else if ( selectedIndex == 2 ) {
                component.setPlayer( this._player );
            }

			// Add radius component
			var focusComponent = new ChuClone.components.camera.CameraFocusRadiusComponent();
			this._camera.addComponentAndExecute( focusComponent );
			focusComponent.getRadius().x = this._propProxy.radius.x;
			focusComponent.getRadius().y = this._propProxy.radius.y;
			focusComponent.getRadius().z = this._propProxy.radius.z;

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

        setupEvents: function() {
            var that = this;
            ChuClone.Events.Dispatcher.addListener(ChuClone.components.CharacterControllerComponent.prototype.EVENTS.CREATED, function( aPlayer ) {
                that._player = aPlayer;
//                that.onPlayerCreated( aPlayer );
            });

            // LEVEL DESTROYED
            ChuClone.Events.Dispatcher.addListener(ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_DESTROYED, function( aLevelModel ) {
                that._controls['type'].domElement.childNodes[1].selectedIndex = 0;
            });
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