/**
File:
	ChuCloneServerGame.js
Created By:
	Mario Gonzalez
Project:
	ChuClone
Abstract:
	This is a demo of using Box2d.js with RealTimeMultiplayerNode.js
 	The box2d.js world creation and other things in this demo, are shamelessly lifted from the https://github.com/HBehrens/box2d.js examples
Basic Usage:
 	demoServerGame = new ChuClone.DemoServerGame();
 	demoServerGame.startGameClock();
Version:
	1.0
*/
(function(){
	ChuClone.WorldController = function() {
//		this.setGameDuration( ChuClone.Constants.GAME_DURATION );
		this.setupBox2d();
		return this;
	};

	ChuClone.WorldController.prototype = {
		_world							: null,
        _dbgDraw                        : null,
		_velocityIterationsPerSecond    : 100,
		_positionIterationsPerSecond	: 300,


		/**
		 * Sets up the Box2D world and creates a bunch of boxes from that fall from the sky
		 */
		setupBox2d: function() {

			ChuClone.Constants.GAME_WIDTH /= ChuClone.Constants.PHYSICS_SCALE;
			ChuClone.Constants.GAME_HEIGHT /= ChuClone.Constants.PHYSICS_SCALE;
			ChuClone.Constants.ENTITY_BOX_SIZE /= ChuClone.Constants.PHYSICS_SCALE;


			this.createBox2dWorld();
			this._world.DestroyBody(this._wallBottom);

			for(var i = 0; i < ChuClone.Constants.MAX_OBJECTS ; i ++) {
				var x = (ChuClone.Constants.GAME_WIDTH/2) + Math.sin(i/5);
				var y = i * -ChuClone.Constants.ENTITY_BOX_SIZE*3;

				// Make a square or a box
				if(Math.random() < 0.5) this.createBall(x, y, ChuClone.Constants.ENTITY_BOX_SIZE);
				else this.createBox(x, y, 0, ChuClone.Constants.ENTITY_BOX_SIZE);
			}
		},

		/**
		 * Creates the Box2D world with 4 walls around the edges
		 */
		createBox2dWorld: function() {
			var m_world = new b2World(new b2Vec2(0, -300), true);
			m_world.SetWarmStarting(true);

			// Create border of boxes
			var wall = new b2PolygonShape();
			var wallBd = new b2BodyDef();

			// Left
			wallBd.position.Set(-1.5, ChuClone.Constants.GAME_HEIGHT/2);
			wall.SetAsBox(1, ChuClone.Constants.GAME_HEIGHT*10);
			this._wallLeft = m_world.CreateBody(wallBd);
			this._wallLeft.CreateFixture2(wall);
			// Right
//			wallBd.position.Set(ChuClone.Constants.GAME_WIDTH + 0.55, ChuClone.Constants.GAME_HEIGHT/2);
//			wall.SetAsBox(1, ChuClone.Constants.GAME_HEIGHT*10);
//			this._wallRight = m_world.CreateBody(wallBd);
//			this._wallRight.CreateFixture2(wall);
			// BOTTOM
			wallBd.position.Set(ChuClone.Constants.GAME_WIDTH/2, ChuClone.Constants.GAME_HEIGHT+0.55);
			wall.SetAsBox(ChuClone.Constants.GAME_WIDTH/2, 1);
			this._wallTop = m_world.CreateBody(wallBd);
			this._wallTop.CreateFixture2(wall);
			// TOP
			wallBd.position.Set(ChuClone.Constants.GAME_WIDTH/2, 1);
			wall.SetAsBox(ChuClone.Constants.GAME_WIDTH/2, 1);
			this._wallBottom = m_world.CreateBody(wallBd);
			this._wallBottom.CreateFixture2(wall);

			this._world = m_world;
		},

		/**
		 * Creates a Box2D circular body
		 * @param {Number} x	Body position on X axis
		 * @param {Number} y    Body position on Y axis
		 * @param {Number} radius Body radius
		 * @return {b2Body}	A Box2D body
		 */
		createBall: function(x, y, radius) {
			var fixtureDef = new b2FixtureDef();
			fixtureDef.shape = new b2CircleShape(radius);
			fixtureDef.friction = 0.4;
			fixtureDef.restitution = 0.0;
			fixtureDef.density = 2.0;

			var ballBd = new b2BodyDef();
			ballBd.type = b2Body.b2_dynamicBody;
			ballBd.position.Set(x,y);
			var body = this._world.CreateBody(ballBd);
			body.CreateFixture(fixtureDef);

			// Create the entity for it in RealTimeMultiplayerNodeJS
//			var aBox2DEntity = new ChuClone.Box2DEntity( this.getNextEntityID(), RealtimeMultiplayerGame.Constants.SERVER_SETTING.CLIENT_ID );
//			aBox2DEntity.setBox2DBody( body );
//			aBox2DEntity.entityType = ChuClone.Constants.ENTITY_TYPES.CIRCLE;
//
//			this.fieldController.addEntity( aBox2DEntity );
//
			return body;
		},

		/**
		 * Creates a Box2D square body
		 * @param {Number} x	Body position on X axis
		 * @param {Number} y    Body position on Y axis
		 * @param {Number} rotation	Body rotation
		 * @param {Number} size Body size
		 * @return {b2Body}	A Box2D body
		 */
		createBox: function(x, y, rotation, size, isFixed ) {
            x /= ChuClone.Constants.PHYSICS_SCALE;
			y /= ChuClone.Constants.PHYSICS_SCALE;
            size /= ChuClone.Constants.PHYSICS_SCALE;

			var bodyDef = new b2BodyDef();
			bodyDef.type = isFixed ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
			bodyDef.position.Set(x, y);
			bodyDef.angle = rotation;

			var body = this._world.CreateBody(bodyDef);
			var shape = new b2PolygonShape.AsBox(size, size);
			var fixtureDef = new b2FixtureDef();
			fixtureDef.restitution = 0.1;
			fixtureDef.density = 0.1;//isFixed ? 0 : 1.0;
			fixtureDef.friction = 0.6;
			fixtureDef.shape = shape;
			body.CreateFixture(fixtureDef);

//			Create the entity for it in RealTimeMultiplayerNodeJS
//			var aBox2DEntity = new ChuClone.Box2DEntity( this.getNextEntityID(), RealtimeMultiplayerGame.Constants.SERVER_SETTING.CLIENT_ID );
//			aBox2DEntity.setBox2DBody( body );
//			aBox2DEntity.entityType = ChuClone.Constants.ENTITY_TYPES.BOX;
//
//
//			this.fieldController.addEntity( aBox2DEntity );

			return body;
		},


		/**
		 * Updates the game
		 * Creates a WorldEntityDescription which it sends to NetChannel
		 */
		update: function() {
			var delta = 16 / 1000;
			this.step( delta );

//			if(this.gameTick % 30 === 0) {
//				this.resetRandomBody();
//			}
			// Note we call superclass's implementation after we're done
//			ChuClone.DemoServerGame.superclass.tick.call(this);
		},

		/**
		 * Resets an entity and drops it from the sky
		 */
		resetRandomBody: function() {
			// Retrieve a random key, and use it to retreive an entity
			var allEntities = this.fieldController.getEntities();
			var randomKeyIndex = Math.floor(Math.random() * allEntities._keys.length);
			var entity = allEntities.objectForKey( allEntities._keys[randomKeyIndex] );

			var x = Math.random() * ChuClone.Constants.GAME_WIDTH + ChuClone.Constants.ENTITY_BOX_SIZE;
			var y = Math.random() * -15;
			entity.getBox2DBody().SetPosition( new b2Vec2( x, y ) );
		},

		step: function( delta ) {
			this._world.ClearForces();
//			var delta = (typeof delta == "undefined") ? 1/this._fps : delta;
			this._world.Step(delta, delta * this._velocityIterationsPerSecond, delta * this._positionIterationsPerSecond);
		},

		shouldAddPlayer: function( aClientid, data ) {
//			this.createPlayerEntity( this.getNextEntityID(), aClientid);
		},

		/**
		 * @inheritDoc
		 */
		shouldUpdatePlayer: function( aClientid, data ) {
			var pos = new b2Vec2( data.payload.x, data.payload.y);
			pos.x /= ChuClone.Constants.PHYSICS_SCALE;
			pos.y /= ChuClone.Constants.PHYSICS_SCALE;

			// Loop through each entity, retrieve it's Box2D body, and apply an impulse towards the mouse position a user clicked
			this.fieldController.getEntities().forEach( function(key, entity) {
				var body = entity.getBox2DBody();
				var bodyPosition = body.GetPosition();
				var angle = Math.atan2( pos.y - bodyPosition.y, pos.x - bodyPosition.x );
				var force = 20;
				var impulse = new b2Vec2( Math.cos(angle) * force, Math.sin(angle) * force);
				body.ApplyImpulse( impulse, bodyPosition );
			}, this );
		},

		shouldRemovePlayer: function( aClientid ) {
//			ChuClone.DemoServerGame.superclass.shouldRemovePlayer.call( this, aClientid );
//			console.log("DEMO::REMOVEPLAYER");
		},

        setDebugDraw: function(canvas) {
            this._dbgDraw = new b2DebugDraw();
            var c = canvas.getContext("2d");

            // sublcasses expect visual area inside 64x36
        //	this._dbgDraw.m_drawScale = Math.min(canvas.width/64, canvas.height/36);
                    this._dbgDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_centerOfMassBit);
                    this._dbgDraw.SetSprite(c);
                if(this._world) {
                    this._world.SetDebugDraw(this._dbgDraw);
                    this._world.DrawDebugData();
                }

        }
	};

	// extend RealtimeMultiplayerGame.AbstractServerGame
//	ChuClone.extend(ChuClone.DemoServerGame, RealtimeMultiplayerGame.AbstractServerGame, null);
})()