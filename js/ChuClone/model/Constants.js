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
        IS_EDIT_MODE            : function(){
            return window.location.href.toLowerCase().indexOf("edit") != -1;
        },

		// TODO: ALWAYS USE SERVER CONSTANT BEFORE ALL LOADING
		SERVER: {
			ASSET_PREFIX: ""
		},

//		WASD controls
        KEYS: {
            A: 65,
            W: 87,
            D: 68,
            S: 83
        },

        EDITOR: {
            PANEL_DOMELEMENT : document.getElementById("guiContainer"),
            PANEL_WIDTH         : 190,
			PATH_SERVER_LOCAL_SAVE	: "assets/levels/save.php"
        },

        ENTITY_TYPES: {
            PLAYER: 1 << 1,
            PLATFORM: 1 << 2,
        },

        PLAYER: {
            WIDTH: 30,
            HEIGHT: 30,
            DEPTH: 30,
            MATERIAL: new THREE.MeshPhongMaterial( { ambient: 0xff, color: 0x666666, specular: 0xDDDDDD, shininess:1, shading: THREE.FlatShading } )
        }
    }
})();