/**
 File:
    PortalGunComponent.js
 Created By:
    Mario Gonzalez
 Project    :
    ChuClone
 Abstract:
 	Controls the shooting of a portal

 Basic Usage:

  License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
	var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var b2BodyDef = Box2D.Dynamics.b2BodyDef;
    var b2Body = Box2D.Dynamics.b2Body;
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;

    "use strict";
    ChuClone.namespace("ChuClone.components.player");
    
    var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;

	ChuClone.components.player.PortalGunComponent = function() {
		ChuClone.components.player.PortalGunComponent.superclass.constructor.call(this);
		this.requiresUpdate = true;
		this._tracerActive = false;
		this._closures = {};
	};

	ChuClone.components.player.PortalGunComponent.prototype = {
        /**
         * @type {String}
         */
		displayName						: "PortalGunComponent",					// Unique string name for this Trait


		/**
		 * @type {Object}
		 */
		_closures			: null,


		/**
		 * @type {THREE.Vector2}
		 */
		_mousePosition		: null,

		/**
		 * @type {Number}
		 */
		_angle				: null,

		/**
		 * @type {Box2D.Dynamics.b2Body}
		 */
		_tracer				: null,

		/**
		 * @type {ChuClone.GameEntity}
		 */
		_tracerEntity		: null,

		/**
		 * When we fire this is true, until the tracer hits something
		 * @type {Boolean}
		 */
		_tracerActive		: false,

		/**
		 * A force we apply every frame to counter the world's gravity so our bullet floats forever
		 * @type {Box2D.Common.Math.b2Vec2}
		 */
		_antiGravity		: null,

		/**
		 * @type {ChuClone.GameEntity}
		 */
		_bluePortal			: null,


		/**
		 * @type {ChuClone.GameEntity}
		 */
		_orangePortal		: null,

		/**
		 * This variable alternates between _bluePortal/_orangePortal
		 * @type {ChuClone.GameEntity}
		 */
		_nextPortal : null,

		/**
		 * @type {THREE.Mesh}
		 */
		_pointer			: null,

		/**
		 * @type {ChuClone.physics.WorldController}
		 */
		_worldController	: null,

		/**
		 * @type {ChuClone.GameViewController}
		 */
		_gameViewController : null,

        /**
         * @type {Boolean}
         */
        _shiftIsDown        : false,

        /**
         * Creates a fixture and attaches to the attachedEntity's Box2D body
         */
        attach: function( anEntity ) {
            ChuClone.components.player.PortalGunComponent.superclass.attach.call(this, anEntity);
			if( !this._worldController || !this._gameViewController ) {
				console.error("PortalGunController - Could not attach. Please call setWorldController & setGameViewController before attaching!");
				return;
			}
			// If edit mode, start our extra draw
			if( ChuClone.model.Constants.IS_EDIT_MODE() ) {
				var that = this;
				this.attachedEntity.drawCustom = function( b2World ){ that.drawPlatformForEditor( b2World ) };
			}


			this._mousePosition = new THREE.Vector2();
			this._projector = new THREE.Projector();
			this.setupPointerHelper();
			this.setupEvents();
			this.setupTracerBullet();
			this.setupPortals();
        },

		/**
		 * Sets up the object used as a visual guide for our pointer
		 */
		setupPointerHelper: function() {
			var geometry = new THREE.CubeGeometry( 5, 30, 5 );
            this._pointer = new THREE.Mesh( geometry, [new THREE.MeshLambertMaterial( {
                color: 0x05f4ff,
                shading: THREE.SmoothShading,
                map : ChuClone.utils.TextureUtils.GET_TEXTURE( ChuClone.model.Constants.SERVER.ASSET_PREFIX + "assets/images/game/floor.png" )
            })] );


            this._gameViewController.addObjectToScene(this._pointer );
		},

		/**
		 * This is the bullet we will use to see if we hit a wall, and then create portals
		 */
		setupTracerBullet: function() {
			var fixtureDef = new b2FixtureDef();
            fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
            fixtureDef.shape.SetAsBox( 0.1, 0.1 );
            fixtureDef.friction = 0;
            fixtureDef.restitution = 0.0;
            fixtureDef.density = 1.0;

			// Create a body definition
            var bodyDef = new b2BodyDef();
            bodyDef.type = b2Body.b2_dynamicBody;
            bodyDef.position.Set(-99,-99);

			// Create the body and fixture
			var body = this._worldController.getWorld().CreateBody(bodyDef);
			body.SetBullet( true );
            var fixture = body.CreateFixture(fixtureDef);
			fixture.SetUserData( this );

			// Set collision filter
			var filter = new Box2D.Dynamics.b2FilterData();
			filter.categoryBits = ChuClone.model.Constants.PHYSICS.COLLISION_CATEGORY.PLAYER;
			filter.maskBits = ChuClone.model.Constants.PHYSICS.COLLISION_CATEGORY.PLAYER | ChuClone.model.Constants.PHYSICS.COLLISION_CATEGORY.WORLD_OBJECT;
			filter.groupIndex = ChuClone.model.Constants.PHYSICS.COLLISION_GROUP.PLAYER;
			fixture.SetFilterData(filter);
			//fixture.SetSensor(true);

			this._tracer = body;
			this._antiGravity = new b2Vec2(0, this._tracer.GetMass() * -this._worldController.getWorld().GetGravity().y);


			this._tracerEntity = new ChuClone.GameEntity();
			this._tracerEntity.setBody( this._tracer);
			this._tracerEntity.setView( this._pointer );
			this._tracerEntity.setDimensions( 10, 50, 10 );
			this._tracerEntity.setIsSavable( false );
			this._tracerEntity.getView().visible = false;
		},


		/**
		 * Creates two portals, orange & blue
		 */
		setupPortals: function(  ) {
			var width = 2 * PTM_RATIO;
			var height = PTM_RATIO;
			var depth = 2 * PTM_RATIO;


			var colors = [0xFF00FF, 0xff0054];
			for(var i = 0; i < 2; i++) {
				// Create the b2Body
				var newBody = this._worldController.createRect( -99, Math.random() * 10, 0, width, height, true);

				// Create the THREE.js mesh
				var view = this._gameViewController.createEntityView( 10, 10, width, height, depth );
				var entity = new ChuClone.GameEntity();
				entity.setBody( newBody );
				entity.setView( view );
				entity.setDimensions( width, height, depth );
				entity.setIsSavable( false );

				var portalComponent = new ChuClone.components.PortalComponent();
				entity.addComponentAndExecute( portalComponent );
				portalComponent.setColor(colors[i]);
				portalComponent.setIsActive( false );


				if( i === 0 ) this._bluePortal = entity;
				else if ( i === 1) this._orangePortal = entity;
			}

			this._nextPortal = this._bluePortal;
		},

		/**
		 * Sets up events and store the closures
		 */
		setupEvents: function() {
			var that = this;

			this._closures['onKeyDown'] = function(e){ that.onKeyDown(e); };
			this._closures['onKeyUp'] = function(e){ that.onKeyUp(e); };
			this._closures['onMouseMove'] = function(e){ that.onMouseMove(e); };
			this._closures['onMouseMove'] = function(e){ that.onMouseMove(e); };
			this._closures['onMouseDown'] = function(e){ that.onMouseDown(e); };
			this._closures['onContextMenu'] = function(e){ that.onContextMenu(e); };

			ChuClone.DOM_ELEMENT.addEventListener('keydown', this._closures.onKeyDown, true);
			ChuClone.DOM_ELEMENT.addEventListener('keyup', this._closures.onKeyUp, true);
			ChuClone.DOM_ELEMENT.addEventListener('mousemove', this._closures.onMouseMove, true);
			ChuClone.DOM_ELEMENT.addEventListener('mousedown', this._closures.onMouseDown, true);
			ChuClone.DOM_ELEMENT.addEventListener('contextmenu',this._closures.onContextMenu, true);
		},

		/**
		 * Toggles aimer visiblity
		 * @param e
		 */
		onKeyDown: function(e) {
			if( e.keyCode == ChuClone.model.Constants.KEYS.LEFT_SHIFT ) {
				//this.displayTracer();
                this._shiftIsDown = true;
				this._tracerEntity.getView().visible = true;
			}
		},

		/**
		 * Toggles aimer visiblity
		 * @param e
		 */
		onKeyUp: function(e) {
			if( e.keyCode == ChuClone.model.Constants.KEYS.LEFT_SHIFT && !this._tracerActive ) {
                this._shiftIsDown = true;
				this._tracerEntity.getView().visible = false;
			}
		},

		/**
		 * Updates the mouse position and angle of the gun
		 * @param e
		 */
		onMouseMove: function(e) {
			if( !this._shiftIsDown ) return;
			//
            if( e ) {
			    this._mousePosition.x = ( event.layerX / ChuClone.model.Constants.VIEW.DIMENSIONS.width  ) * 2 - 1;
                this._mousePosition.y = - ( event.layerY / ChuClone.model.Constants.VIEW.DIMENSIONS.height ) * 2 + 1;
            }


			// Convert the characters position to 2D screen cordinates and use that to get the angle
			this._projectedMouse = this._projector.projectVector( this.attachedEntity.getView().position.clone(), this._gameViewController.getCamera() );
			this._angle =  Math.atan2(this._mousePosition.y - this._projectedMouse.y, this._mousePosition.x - this._projectedMouse.x);
		},

		/**
		 * Updates the mouse position and angle of the gun
		 * @param e
		 */
		onMouseDown: function(e) {
			if( !e.shiftKey )
				return;

			// Set the portal by left or right click mouse
			this._nextPortal = (e.button == 0) ? this._bluePortal : this._orangePortal;

			///*
			var radius = 50 / PTM_RATIO;
			var pointPosition = this.attachedEntity.getBody().GetPosition().Copy();
			pointPosition.x += Math.cos(-this._angle)*radius;
			pointPosition.y += Math.sin(-this._angle)*radius;

			this._tracerActive = true;
			this._lastCollisionLocation = null;
			this._tracer.SetPositionAndAngle( new b2Vec2(pointPosition.x, pointPosition.y), 0);


			this.playSound( ChuClone.model.Constants.SOUNDS.PORTAL_SHOOT.id );

			// Place the tracer entity at our location
			this._tracerEntity.getView().position = this.attachedEntity.getView().position.clone();

			// Attach a motionstreak component and reset it
            var motionstreak = this._tracerEntity.getComponentWithName( ChuClone.components.effect.MotionStreakComponent.prototype.displayName ) || this._tracerEntity.addComponentAndExecute( new ChuClone.components.effect.MotionStreakComponent() );
			motionstreak.resetStreak();

			e.preventDefault();
			e.stopImmediatePropagation();
			e.stopPropagation();

            this.castPortalRay();
		},


        /**
         * Cast a ray from the portalgun to nearest fixture
         */
        castPortalRay: function() {

			var that = this;
			this._nextPortal.getComponentWithName( ChuClone.components.PortalComponent.prototype.displayName ).setIsActive( true );
			this._lastLine = null;

            // Cast a ray from where we are to somewhere far away along the direction of our angle
            var bodyPosition = this.attachedEntity.getBody().GetPosition().Copy();

			// Project outward slightly from our current position
            var pointA = bodyPosition.Copy();
            pointA.x += Math.cos(this._angle);
            pointA.y += Math.sin(this._angle)*-1;

			// Using our angle, extrapolate by a large number to create a long linesegment
            var pointB = bodyPosition.Copy();
            pointB.x += Math.cos(this._angle) * 1000;
            pointB.y += Math.sin(this._angle) * -1000;


			// Locally store properties within the function closure to be kept after the raycast callback
            var rayFixture = null;
            var rayPoint = null;
            var rayNormal = null;
            var rayFraction = 1;

			var nearestHit = null;
			/**
			 * Call back for each fixture hit by the ray
			 * @param fixture
			 * @param point
			 * @param normal
			 * @param fraction
			 */
            var callback = function RayCastOneWrapper(fixture, point, normal, fraction) {
                //debugger;
                if (fraction === undefined) fraction = 0;
                if (fraction > rayFraction) return;
                //if( fraction)

                if ( !that._tracerActive || !fixture.GetBody() ) return;

                var otherActor = fixture.GetBody().GetUserData();
                if ( !otherActor ) return;


                // Things that if we hit them - our tracer bullet is considered inactive
                if (otherActor.getComponentWithName(ChuClone.components.FrictionPadComponent.prototype.displayName)
                    || otherActor.getComponentWithName(ChuClone.components.DeathPadComponent.prototype.displayName)
                    || otherActor.getComponentWithName(ChuClone.components.JumpPadComponent.prototype.displayName)) {

					nearestHit = point;
                    rayFixture = null;
                    rayPoint = null;
                    rayNormal = null;
					rayFraction = fraction;
                    return;
                }

                // Things that if we hit - we ignore and allow the tracer bullet to pass through it
                if( otherActor.getComponentWithName(ChuClone.components.PortalComponent.prototype.displayName )
                    || otherActor.getComponentWithName(ChuClone.components.RespawnComponent.prototype.displayName ) ) {

					nearestHit = point;
                    return;
                }

                rayFixture = fixture;
                rayPoint = point;
                rayNormal = normal;
                rayFraction = fraction;
                //that._tracerActive = false;
                return fraction;
            };

			// Cast the ray
            this._worldController.getWorld().RayCast(callback, pointA, pointB);
            this._tracerActive = false;

			// Nothing found
            if(!rayFixture) {
				this.playSound( ChuClone.model.Constants.SOUNDS.PORTAL_INVALID.id );
				//pointB.Multiply(0.5);
				this._tracer.SetPositionAndAngle( nearestHit || pointB, 0);
				return;
			}


			// Push outward otherwise technically our line segements will not touch due to rounding errors
            this._rayPoint = rayPoint.Copy();
			this._rayPoint.x += Math.cos(this._angle) * 0.05;
			this._rayPoint.y += Math.sin(this._angle) * -0.05;
			this._tracer.SetPositionAndAngle( new b2Vec2(this._rayPoint.x, this._rayPoint.y), 0);


			var otherBody = rayFixture.GetBody();
			var lines = ChuClone.model.LineSegment.prototype.FROM_BODY( otherBody );
			var lineTestResults = [];
			var playerToTracer = new ChuClone.model.LineSegment(bodyPosition.Copy(), this._rayPoint );
			for(var i = 0; i < lines.length; i++) {
				var aLine = lines[i];
				aLine.rotate( otherBody.GetAngle() );

				var result = ChuClone.model.LineSegment.prototype.INTERSECT_LINES( playerToTracer, aLine );
				for(var j = 0; j < result.length; j++) {
					//lineTestResults.push({line: aLine, point: result[j]});
					this._lastLine = aLine; // debug draw
					//break;
				}
			}


			if( !this._lastLine ) {
				this.playSound( ChuClone.model.Constants.SOUNDS.PORTAL_INVALID.id );
				return;
			}

			// Some final checks to see if the collision was valid (enough padding etc)
			var portalWidth = this._nextPortal.getDimensions().width / PTM_RATIO * 2;
			var lineDistance = this._lastLine.getLength();
			var portalToA = new ChuClone.model.LineSegment( this._lastLine.getA(), rayPoint ).getLength();
			var portalToB = new ChuClone.model.LineSegment( this._lastLine.getB(), rayPoint ).getLength();

			// Not enough space for the portal to go there
			if( portalWidth >= lineDistance || portalWidth*0.25 >= portalToA || portalWidth*0.25 >= portalToB ) {
				console.log("Can't fit!");
				this.playSound( ChuClone.model.Constants.SOUNDS.PORTAL_INVALID.id );
				this._tracerEntity.removeComponentWithName( ChuClone.components.effect.MotionStreakComponent.prototype.displayName );
				this._tracerActive = false;
				return;
			}

			setTimeout( function() {
				var finalAngle = that._lastLine.getAngle() + Math.PI;
				that.playSound( ChuClone.model.Constants.SOUNDS.PORTAL_OPEN.id );


				// Offset the position so that the back of the portal is touching it, not the center
				var finalPosition = rayPoint.Copy();
                finalPosition.x -= Math.cos(finalAngle + Math.PI/2);
				finalPosition.y -= Math.sin(finalAngle + Math.PI/2);

				// Place portal at new location
				that._nextPortal.getBody().SetPosition( finalPosition );
				that._nextPortal.getComponentWithName(ChuClone.components.PortalComponent.prototype.displayName).setAngle( ( finalAngle ) * 180/Math.PI );

			}, 1);


			this.setNextPortal();
        },

		/**
		 * Disables the rightcick context menu so we can use that for the portal
		 * @param e
		 */
		onContextMenu: function(e) {
			if( e.shiftKey ) {
				e.preventDefault();
				e.stopImmediatePropagation();
				e.stopPropagation();
				return false;
			}
		},



		/**
		 * Positions the portal gun
		 */
		update: function() {
            var scalar = 120;

            if( this._shiftIsDown ) {
                this.onMouseMove();
            }

			if( !this._tracerActive ) {
				var pointPosition = this.attachedEntity.getView().position.clone();
				pointPosition.x += Math.cos(this._angle) * scalar;
				pointPosition.y += Math.sin(this._angle) * scalar;
				this._pointer.position = pointPosition;
			}

			//var glide = 0.4;
            this._pointer.rotation.z = this._angle+Math.PI/2;

			// Apply a force to counteract gravity
			if( this._tracer ) {
				this._tracer.ApplyForce( this._antiGravity, this._tracer.GetWorldCenter() );

				if( this._lastCollisionLocation ) {
					this._tracer.SetPosition( this._lastCollisionLocation );
				}
			}
		},


		/**
         * Special drawing function while editing that shows the extents of the platforms movements
         * @param {Box2D.Dynamics.b2World}  Reference to b2World instance
         */
		fakeAngle: 0,
        drawPlatformForEditor: function( b2World ) {
			this.fakeAngle += 0.01;
			if(this._lastLine) {
				var line = this._lastLine.clone();
				var x0 = (line._a.x + b2World.m_debugDraw.offsetX) * b2World.m_debugDraw.m_drawScale;
				var y0 = (line._a.y + b2World.m_debugDraw.offsetY) * b2World.m_debugDraw.m_drawScale;
				var x1 = (line._b.x + b2World.m_debugDraw.offsetX) * b2World.m_debugDraw.m_drawScale;
				var y1 = (line._b.y + b2World.m_debugDraw.offsetY) * b2World.m_debugDraw.m_drawScale;

				b2World.m_debugDraw.m_ctx.moveTo( x0, y0 );
				b2World.m_debugDraw.m_ctx.lineTo( x1, y1 );
				b2World.m_debugDraw.m_ctx.strokeStyle = "#FF0000";
				b2World.m_debugDraw.m_ctx.stroke();
			}

            if(this._rayPoint) {
				var rayPoint = this._rayPoint.Copy();
                rayPoint.x = (rayPoint.x + b2World.m_debugDraw.offsetX) * b2World.m_debugDraw.m_drawScale;
                rayPoint.y = (rayPoint.y + b2World.m_debugDraw.offsetY) * b2World.m_debugDraw.m_drawScale;

                b2World.m_debugDraw.m_ctx.arc(rayPoint.x, rayPoint.y, 10* b2World.m_debugDraw.m_drawScale, 0, Math.PI*2, false);
			}
		},

		/**
		 * Wrapper to dispatch an event that will cause the audiocontroller to play a saound
		 * @param id
		 */
		playSound: function( id ) {
			ChuClone.Events.Dispatcher.emit(
					ChuClone.controller.AudioController.prototype.EVENTS.SHOULD_PLAY_SOUND,
					id);
		},

        /**
         * @inheritDoc
         */
        detach: function() {
			ChuClone.DOM_ELEMENT.removeEventListener('keydown', this._closures.onKeyDown);
			ChuClone.DOM_ELEMENT.removeEventListener('keyup', this._closures.onKeyUp);
            ChuClone.DOM_ELEMENT.removeEventListener('mousemove', this._closures.onMouseMove);
			ChuClone.DOM_ELEMENT.removeEventListener('mousedown', this._closures.onMouseDown);
			ChuClone.DOM_ELEMENT.removeEventListener('contextmenu',this._closures.onContextMenu);
			this._closures = null;

			if( this._tracer ) {
				this._worldController.getWorld().DestroyBody( this._tracer );
				this._tracer = null;
			}

			if( this._bluePortal ) {
				if( this._bluePortal.getView() ) this._gameViewController.removeObjectFromScene( this._bluePortal.getView() );
				if( this._bluePortal.getBody() ) this._worldController.getWorld().DestroyBody( this._bluePortal.getBody() );
				this._bluePortal.dealloc();
				this._bluePortal = null;
			}

			if( this._orangePortal ) {
				if( this._orangePortal.getView() ) this._gameViewController.removeObjectFromScene( this._orangePortal.getView() );
				if( this._orangePortal.getBody() ) this._worldController.getWorld().DestroyBody( this._orangePortal.getBody() );
				this._orangePortal.dealloc();
				this._orangePortal = null;
			}

			this._gameViewController.removeObjectFromScene( this._pointer );
			this._pointer = null;

			this.attachedEntity.drawCustom = null;
			this._lastCollisionLocation = null;
			this._nextPortal = null;
			this._gameViewController = null;
			this._worldController = null;
            ChuClone.components.player.PortalGunComponent.superclass.detach.call(this);
        },

		///// ACCESSORS
		setGameView: function( aGameViewController ) { this._gameViewController = aGameViewController },
		setWorldController: function( aWorldController ) { this._worldController = aWorldController },

		// When called, will set the next portal to orange or blue
		setNextPortal: function() { this._nextPortal = (this._nextPortal === this._bluePortal) ? this._orangePortal  : this._bluePortal }
	};

    ChuClone.extend( ChuClone.components.player.PortalGunComponent, ChuClone.components.BaseComponent );
})();



		/**
		 * Called when our portal 'bullet' collides with something

		onCollision: function( otherActor ) {
            return;
			if( !otherActor ) return;

			// Things that if we hit them - our tracer bullet is considered inactive
			if( !this._tracerActive || otherActor.getComponentWithName(ChuClone.components.FrictionPadComponent.prototype.displayName )
					|| otherActor.getComponentWithName(ChuClone.components.DeathPadComponent.prototype.displayName )
					|| otherActor.getComponentWithName(ChuClone.components.JumpPadComponent.prototype.displayName ) ) {

				this._tracerEntity.removeComponentWithName( ChuClone.components.effect.MotionStreakComponent.prototype.displayName );
				this._tracerActive = false;
				return;
			}

			// Things that if we hit - we ignore and allow the tracer bullet to pass through it
			if( otherActor.getComponentWithName(ChuClone.components.PortalComponent.prototype.displayName )
				|| otherActor.getComponentWithName(ChuClone.components.RespawnComponent.prototype.displayName ) ) {
				return;
			}

			var playerBody = this.attachedEntity.getBody();
			var otherBody = otherActor.getBody();
			var shape = otherBody.GetFixtureList().GetShape();
			var bodyPos = otherBody.GetPosition();



			// Extend the position of the tracer bullet a bit
			var fakePosition = this._tracer.GetPosition().Copy();
			var fakeVelocity = this._tracer.GetLinearVelocity();
			fakeVelocity.Multiply(0.01);
			fakePosition.Add( fakeVelocity );
			var playerToTracer = new ChuClone.model.LineSegment(playerBody.GetPosition().Copy(), fakePosition );

			// Compare all 4 lines to the line segment from the player to the tracer
			var otherBody = otherActor.getBody();
			var lines = ChuClone.model.LineSegment.prototype.FROM_BODY( otherBody );
			var lineTestResults = [];
			for(var i = 0; i < lines.length; i++) {
				var aLine = lines[i];
				aLine.rotate( Math.PI/2 );
				var result = ChuClone.model.LineSegment.prototype.INTERSECT_LINES( playerToTracer, aLine );
				for(var j = 0; j < result.length; j++) {
					//lineTestResults.push({line: aLine, point: result[j]});
					this._lastLine = aLine; // debug draw
					//break;
				}
			}

			// Determine which of the collisions was the closest to the player
			var closestDistance = Number.MAX_VALUE;
			var playerPosition = playerBody.GetPosition();
			var lineSegmentHit = this._lastLine;
			for(i = 0; i < lineTestResults.length; i++) {
				var dist = Box2D.Common.Math.b2Math.DistanceSquared( playerPosition, lineTestResults[i].point );
				if( dist < closestDistance ) {
					closestDistance = dist;
					lineSegmentHit = aLine;
					this._lastLine = aLine; // debug draw
				}
			}

			if( !this._lastLine ) {
				return;
			}

			// Some final checks to see if the collision was valid
			var portalWidth = this._nextPortal.getDimensions().width / PTM_RATIO * 2;
			var lineDistance = this._lastLine.getLength();
			var portalToA = new ChuClone.model.LineSegment( this._lastLine.getA(), this._tracer.GetPosition()).getLength();
			var portalToB = new ChuClone.model.LineSegment( this._lastLine.getB(), this._tracer.GetPosition()).getLength();

			// Not enough space for the portal to go there
			if( portalWidth >= lineDistance || portalWidth*0.3 >= portalToA || portalWidth*0.3 >= portalToB ) {
				//console.log("Can't fit!");
				this._tracerEntity.removeComponentWithName( ChuClone.components.effect.MotionStreakComponent.prototype.displayName );
				this._tracerActive = false;
				return;
			}


			this._collisionAngle = this._lastLine.getAngle();
			this._lastCollisionLocation = this._tracer.GetPosition().Copy();
			this._tracerActive = false;

			var that = this;
			setTimeout( function() {
				var finalAngle = that._collisionAngle + Math.PI;

				// Offset the position so that the back of the portal is touching it, not the center
				var finalPosition = that._lastCollisionLocation.Copy();
				finalPosition.x += Math.cos(that._collisionAngle + Math.PI/2);
				finalPosition.y += Math.sin(that._collisionAngle + Math.PI/2);

				that._nextPortal.getBody().SetPositionAndAngle( finalPosition, finalAngle);
				that._nextPortal.getComponentWithName(ChuClone.components.PortalComponent.prototype.displayName).setAngle( finalAngle * 180/Math.PI );
			}, 1);


			this.setNextPortal();
		},

 */