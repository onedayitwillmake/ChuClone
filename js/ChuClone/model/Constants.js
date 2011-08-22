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
        DOM_ELEMENT             : null,
		INITIAL_STATE			: 'PlayLevel',
        IS_EDIT_MODE            : function(){
            return window.location.href.toLowerCase().indexOf("edit") != -1;
        },

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

		// WASD KEYS
        KEYS: {
            A: 65,
            W: 87,
            D: 68,
            S: 83,
			UP_ARROW: 38,
			DOWN_ARROW: 40,
			LEFT_ARROW: 37,
			RIGHT_ARROW: 39
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
            MATERIAL: new THREE.MeshPhongMaterial( { ambient: 0xff, color: 0x666666, specular: 0xDDDDDD, shininess:1, shading: THREE.FlatShading } )
        }
    }
})();