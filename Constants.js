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
	ChuClone.Constants = {
        GAME_WIDTH				: 700,
		GAME_HEIGHT				: 450,
        // TODO: MIGRATE FROM PHYSICS_SCALE TO PTM_RATIO
		PHYSICS_SCALE			: 1,
        PTM_RATIO               : 64,
		GAME_DURATION			: 1000*300,

        KEYS: {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,

        }
	}
})();