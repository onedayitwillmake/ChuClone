/**
 File:
    Constants.js
 Created By:
    Mario Gonzalez
 Project:
    ChuClone
 Abstract:
    This class contains Constants used by the ChuClone
 Basic Usage:
     [This class is not instantiated! - below is an example of using this class by extending it]
     var clientDropWait = RealtimeMultiplayerGame.Constants.CL_DEFAULT_MAXRATE
 Version:
    1.0

 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";

    ChuClone.namespace("ChuClone.model");
    ChuClone.model.Constants = {
        GAME_WIDTH				: 1000,
        GAME_HEIGHT				: 500,
        PTM_RATIO               : 64,
		TO_DEGREES				: 180/Math.PI,
		TO_RADIANS				: Math.PI/180,
        DOM_ELEMENT             : null,
		INITIAL_STATE			: 'PlayLevel',
        IS_EDIT_MODE            : function(){
            return window.location.href.toLowerCase().indexOf("edit") != -1;
        },
        IS_KONGREGATE           : function() {
            return window.location.href.indexOf("kongregate") != -1;
        },
		IS_BLOOM				: false,
		MAX_LEVEL_AREA			: 400000000,

		SERVER: {
			ASSET_PREFIX			: "", 					// Prefix all asset request with this
			LEVEL_LOAD_LOCATION		: "/levels/",			// Location of where levels can be loaded from
			USER_LEVELS_LOCATION	: "/levels/data.json",	// Location to retrieve user levels
			USER_SUBMIT_LOCATION	: "/levels/create_from_editor.js",	// Location to retrieve user levels
			SCORE_SUBMIT_LOCATION   : "/levels/#/highscores.json",	// Location to retrieve user levels
			SCORE_LOAD_LOCATION		: "/levels/#/highscores"	// Location to retrieve user levels
		},

		TIMINGS: {
			TUTORIAL_FADE_OUT_TIME	: 3500
		},

        // Joystick component
        JOYSTICK: {
            ENABLED: false,
            SERVER_LOCATION: "localhost",
            SERVER_PORT: "8081"
        },

		VIEW: {
			DIMENSIONS: {
				width: 0,
				height:0
			},
			CAMERA: null
		},
		// WASD KEYS
        KEYS: {
            A: 65,
            W: 87,
            D: 68,
            S: 83,
			X: 88,
			C: 67,
			UP_ARROW: 38,
			DOWN_ARROW: 40,
			LEFT_ARROW: 37,
			RIGHT_ARROW: 39,
			LEFT_SHIFT: 16
        },

        EDITOR: {
            PANEL_DOMELEMENT : document.getElementById("guiContainer"),
            PANEL_WIDTH         : 190,
			PATH_SERVER_LOCAL_SAVE	: "assets/levels/save.php"
        },

        ENTITY_TYPES: {
            PLAYER: 1 << 1,
            PLATFORM: 1 << 2
        },


        PLAYER: {
            WIDTH: 30,
            HEIGHT: 30,
            DEPTH: 30,
            MATERIAL: new THREE.MeshPhongMaterial( { ambient: 0xff, color: 0x666666, specular: 0xDDDDDD, shininess:1, shading: THREE.FlatShading } ),
			RECORDING_INTERVAL: 150
        },

		PHYSICS: {
			COLLISION_CATEGORY: {
					PLAYER: 1 << 1,
					WORLD_OBJECT: 1 << 2,
					NONE: 1 << 3
			},
			COLLISION_GROUP: {
				PLAYER: -1,
				WORLD_OBJECT: -2
			},

			CONTROLLER: null,
			WORLD: null
		},

		SOUNDS: {
			PORTAL_ENTER: {id:'PORTAL_ENTER', src:"assets/sounds/fx/portals/enter.mp3"},
			PORTAL_INVALID: {id:'PORTAL_INVALID', src:"assets/sounds/fx/portals/invalidsurface.mp3"},
			PORTAL_OPEN: {id:'PORTAL_OPEN', src:"assets/sounds/fx/portals/open.mp3"},
			PORTAL_SHOOT: {id:'PORTAL_SHOOT', src:"assets/sounds/fx/portals/shoot.mp3"}
		}
    }
})();