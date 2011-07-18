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
        this.augmentCamera( this._camera );

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
        _propProxy          : {x: 5, y: 5, z: 3, radius: new THREE.Vector3(5400, 1680, 4500), fullscreen: false},

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
            var camTypeNames = ["None", "Follow Editor", "Follow Player"];
            this._controls['type'] = this._gui.add(this, '_type');
            this._controls['type'].options.apply( this._controls['type'], camTypeNames);
            this._controls['type'].onChange( function() {
                var selected = this.domElement.childNodes[1].selectedIndex;

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

			// Fullscreen
			this._controls['fullscreen'] = this._gui.add(this._propProxy, 'fullscreen').name("Fullscreen").onChange(function( aValue ) {
				ChuClone.editor.WorldEditor.getInstance().getViewController().setFullscreen( aValue );
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
			for(var i = 0; i < this._camTypes.length; i++) {
				if(!this._camTypes[i]) continue;
				this._camera.removeComponentWithName( this._camTypes[i].prototype.displayName );
			}

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
         * Adds component stuff from GameEntity to the camera, bit of a hack
         * @param {THREE.Camera}
         */
        augmentCamera: function( aCamera ) {

			if( aCamera.hasOwnProperty('components') ) {
				console.error("CameraGUI.augmentCamera - Attempting to augment camera that already contains 'components' property ");
				return;
			}
            aCamera.components = [];
            for(var prop in ChuClone.GameEntity.prototype) {
                if(! ChuClone.GameEntity.prototype.hasOwnProperty(prop) ) return;

                // Steal all component related functions
                if(prop.toLowerCase().indexOf("component") !== -1 &&
                    ChuClone.GameEntity.prototype[prop] instanceof Function) {

                    // Throw error if camera already has such a property, probably something has gone wrong
                    aCamera[prop] = ChuClone.GameEntity.prototype[prop];
                }
            }

            // Augment the update function
            aCamera.superUpdate = aCamera.update;
            aCamera.update = function() {
                var len = this.components.length;
                for(var i = 0; i < len; ++i ) {
                    if( this.components[i].requiresUpdate ) {
                        this.components[i].update();
                    }
                }
                this.superUpdate.call( this );
            }
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