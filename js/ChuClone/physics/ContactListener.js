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
//
//	/// Implement this class to get collision results. You can use these results for
//	/// things like sounds and game logic. You can also get contact results by
//	/// traversing the contact lists after the time step. However, you might miss
//	/// some contacts because continuous physics leads to sub-stepping.
//	/// Additionally you may receive multiple callbacks for the same contact in a
//	/// single time step.
//	/// You should strive to make your callbacks efficient because there may be
//	/// many callbacks per time step.
//	/// @warning The contact separation is the last computed value.
//	/// @warning You cannot create/destroy Box2D entities inside these callbacks.
//	public class b2ContactListener {
//
//		/// Called when a contact point is added. This includes the geometry
//		/// and the forces.
//		public virtual function Add(point:b2ContactPoint):void {
//			trace("Collision between "+point.shape1.GetBody().GetUserData().name+" and "+point.shape2.GetBody().GetUserData().name);
//			point.shape1.GetBody().GetUserData().alpha=0.5
//			point.shape2.GetBody().GetUserData().alpha=0.5
//		}
//
//		/// Called when a contact point persists. This includes the geometry
//		/// and the forces.
//		public virtual function Persist(point:b2ContactPoint):void {
//			point.shape1.GetBody().GetUserData().alpha=0.5
//			point.shape2.GetBody().GetUserData().alpha=0.5
//		}
//
//		/// Called when a contact point is removed. This includes the last
//		/// computed geometry and forces.
//		public virtual function Remove(point:b2ContactPoint):void {
//			point.shape1.GetBody().GetUserData().alpha=1
//			point.shape2.GetBody().GetUserData().alpha=1
//		}
//
//		/// Called after a contact point is solved.
//		public virtual function Result(point:b2ContactResult):void {
//		}
//	}

    ChuClone.physics.ContactListener = function () {
    };

   ChuClone.physics.ContactListener.prototype.BeginContact = function( contact ) {

       return;
        // Box2d objects that collided
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        // Sprites that collided
        var actorA = fixtureA.GetBody().GetUserData();
        var actorB = fixtureB.GetBody().GetUserData();

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