/**
 File:
 ContactListener.js
 Created By:
 Mario Gonzalez - mariogonzalez@gmail.com
 Project:
 ChuClone
 Abstract:
 Proxy for collisions between Box2D world, and ChuClone game entities
 Basic Usage:

 Version:
 1.0

 License:
 Creative Commons Attribution-NonCommercial-ShareAlike
 http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function()
{
	ChuClone.namespace("ChuClone.physics");
	ChuClone.physics.DestructionListener = function() {
		ChuClone.physics.DestructionListener.superclass.constructor.call( this );
	};

	ChuClone.physics.DestructionListener.prototype = {
		SayGoodbyeJoint : function (joint) {
			ChuClone.physics.DestructionListener.superclass.SayGoodbyeJoint.call( this, joint );
		},
		SayGoodbyeFixture : function (fixture) {
			debugger;
			ChuClone.physics.DestructionListener.superclass.SayGoodbyeFixture.call( this, fixture );
		}
	};

	ChuClone.extend( ChuClone.physics.DestructionListener, Box2D.Dynamics.b2DestructionListener );
})();
