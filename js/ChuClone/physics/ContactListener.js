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
(function(){

    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var b2BodyDef = Box2D.Dynamics.b2BodyDef;
    var b2Body = Box2D.Dynamics.b2Body;
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    var b2Fixture = Box2D.Dynamics.b2Fixture;
    var b2World = Box2D.Dynamics.b2World;
    var b2MassData = Box2D.Collision.Shapes.b2MassData;
    var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
//
    ChuClone.namespace("ChuClone.physics");

    ChuClone.physics.ContactListener = function () {
    };

   ChuClone.physics.ContactListener.prototype.BeginContact = function( contact ) {
        // Box2d objects that collided
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();

        // Sprites that collided
        var actorA = fixtureA.GetBody().GetUserData();
        var actorB = fixtureB.GetBody().GetUserData();

       if( fixtureA.GetUserData() && fixtureA.GetUserData().onCollision )
           fixtureA.GetUserData().onCollision(actorB);

       if (actorA && actorA.onCollision)
           actorA.onCollision(actorB);

       if (actorB && actorB.onCollision)
           actorB.onCollision(actorA);

       if( fixtureB.GetUserData() && fixtureB.GetUserData().onCollision )
           fixtureB.GetUserData().onCollision(actorA);

       return;

        // This is only true if for example a sprite touched something in your box2d simulation that was not a sprite such as the ground
        // You may not want to return here, so keep that in mind
        if(actorA == null || actorB == null) return;

        // Information about the collision, such as where it hit exactly on each body
        var b2WorldManifold = new Box2D.Dynamics.b2WorldManifold();
        contact.GetWorldManifold( b2WorldManifold );

        // Maybe you wanna handle it differently but for this example, we're going to simply use our global object (see previous post)
        // To store the gamescene where these bodies exist and tell it they collided
//        [[Global instance]._gameScene onActorDidStartContact:actorA against:actorB at:worldManifold];
    }
    //ChuClone.extend( ChuClone.PlayerEntity, ChuClone.GameEntity, null );

    ChuClone.extend( ChuClone.physics.ContactListener, Box2D.Dynamics.b2ContactListener )
})();