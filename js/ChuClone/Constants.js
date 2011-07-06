/**
 File:
    DemoBox2DConstants.js
 Created By:
    Mario Gonzalez
 Project:
    RealtimeMultiplayerNodeJS - Demo
 Abstract:
    This class contains Constants used by the DemoBox2D in RealtimeMultiplayerGame
 Basic Usage:
     [This class is not instantiated! - below is an example of using this class by extending it]
     var clientDropWait = RealtimeMultiplayerGame.Constants.CL_DEFAULT_MAXRATE

 Version:
    1.0
 */
(function(){
    ChuClone.namespace("ChuClone");
    ChuClone.Constants = {
        GAME_WIDTH				: 700,
        GAME_HEIGHT				: 450,
        PTM_RATIO               : 64,
        GAME_DURATION			: 1000*300,

        KEYS: {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            // WASD
            A: 65,
            W: 87,
            D: 68,
            S: 83
        },

        EDITOR: {
            PANEL_WIDTH     : 190
        },
        
        ENTITIES: {
            DEFAULT_WIDTH   : 300,
            DEFAULT_HEIGHT  : 100,
            DEFAULT_DEPTH   : 1000
        },

        STANDARD_EVENTS: {
            COMPLETE: "complete",
            CREATED: "created",
            REMOVED: "removed"
        },

        PLAYER: {
            WIDTH: 30,
            HEIGHT: 30,
            DEPTH: 30,
            MATERIAL: new THREE.MeshPhongMaterial( { ambient: 0x111111, color: 0x666666, specular: 0xDDDDDD, shininess:1, shading: THREE.FlatShading } ),
        },

        /**
         * @type {EventEmitter}
         */
        DISPATCH: new EventEmitter()
    }
})();