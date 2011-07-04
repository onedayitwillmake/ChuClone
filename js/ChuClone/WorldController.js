/**
 File:
    WorldController.js
 Created By:
    Mario Gonzalez
 Project:
    ChuClone
 Abstract:
     This class controls some Box2D functionality for the game
 Basic Usage:
     setupWorldController: function() {
            this.worldController = new ChuClone.WorldController();
            this.worldController.setupEditor();
        },
 Version:
    1.0
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

    ChuClone.WorldController = function() {
        this.setupBox2d();
        this.setDebugDraw();
    };

    ChuClone.WorldController.prototype = {
        /**
         * @type {Box2D.Dynamics.b2World}
         */
        _world							: null,

        /**
         * @type {ChuClone.editor.WorldEditor}
         */
        _editor                         : null,

        /**
         * @type {Box2D.Dynamics.b2DebugDraw}
         */
        _debugDraw                      : null,
        /**
         * @type {Number}
         */
        _velocityIterationsPerSecond    : 10,
        /**
         * @type {Number}
         */
        _positionIterationsPerSecond	: 30,


        /**
         * Sets up the Box2D world and creates a bunch of boxes from that fall from the sky
         */
        setupBox2d: function() {
            this.createBox2dWorld();
            this.modifySettings();
            this._world.DestroyBody( this._wallRight );
//            this._world.DestroyBody( this._wallLeft );
            this._world.DestroyBody( this._wallTop );
//            this._world.DestroyBody( this._wallTop );
        },

        /**
         * Creates the editor taking a reference to the games view object
         * @param {ChuClone.GameView} aView
         */
        setupEditor: function( aView ) {
            this._editor = new ChuClone.editor.WorldEditor( this, aView );
        },

        /**
         * This is where we modify any of the box2d defaults
         * //TODO: DOESN'T WORK
         */
        modifySettings: function() {
            Box2D.Common.b2Settings.b2_maxRotation = 0;// 0.01;
        },

        /**
         * Creates the Box2D world with 4 walls around the edges
         */
        createBox2dWorld: function() {
            var m_world = new b2World( new b2Vec2(0, 30), true );


            // Create border of boxes
            var wall = new b2PolygonShape();
            var wallBd = new b2BodyDef();

            // Left
            wallBd.position.Set(-1.5, ChuClone.Constants.GAME_HEIGHT/2);
            wall.SetAsBox(1, ChuClone.Constants.GAME_HEIGHT*10);
            this._wallLeft = m_world.CreateBody(wallBd);
            this._wallLeft.CreateFixture2(wall);
            // Right
            wallBd.position.Set(ChuClone.Constants.GAME_WIDTH + 0.55, ChuClone.Constants.GAME_HEIGHT/2);
            wall.SetAsBox(1, ChuClone.Constants.GAME_HEIGHT*10);
            this._wallRight = m_world.CreateBody(wallBd);
            this._wallRight.CreateFixture2(wall);
            // BOTTOM
            wall = new b2PolygonShape();
            wallBd = new b2BodyDef();
            wallBd.position.Set(ChuClone.Constants.GAME_WIDTH/2, 1);
            wall.SetAsBox(ChuClone.Constants.GAME_WIDTH / PTM_RATIO * 8 , 1 / PTM_RATIO);
            this._wallTop = m_world.CreateBody(wallBd);
            this._wallTop.CreateFixture2(wall);
            // TOP
            wall = new b2PolygonShape();
            wallBd = new b2BodyDef();
            wallBd.position.Set(ChuClone.Constants.GAME_WIDTH/2 / PTM_RATIO, ChuClone.Constants.GAME_HEIGHT / PTM_RATIO );
            wall.SetAsBox(ChuClone.Constants.GAME_WIDTH/2 * 100, 1/PTM_RATIO);
            this._wallBottom = m_world.CreateBody(wallBd);
            this._wallBottom.CreateFixture2(wall);

            this._world = m_world;
        },

        /**
         * Creates a Box2D circular body
         * @param {Number} x	Body position on X axis
         * @param {Number} y    Body position on Y axis
         * @param {Number} radius Body radius
         * @return {Box2D.Dynamics.b2Body}	A Box2D body
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

            return body;
        },

        /**
         * Creates a rectangular body. Position is given in pixels and PTM_RATIO is taken into account
         * @param {Number} x
         * @param {Number} y
         * @param {Number} rotation Rotation in radians
         * @param {Number} width
         * @param {Number} height
         * @param {Boolean} isFixed
         * @return {Box2D.Dynamics.b2Body}
         */
        createRect: function( x, y, rotation, width, height, isFixed ) {
            x /= PTM_RATIO;
            y /= PTM_RATIO;
            width /= PTM_RATIO;
            height /= PTM_RATIO;
//            isFixed = false;

            var fixtureDef= new Box2D.Dynamics.b2FixtureDef();
            fixtureDef.density = 1.0;
            fixtureDef.friction = 0.5;
            fixtureDef.restitution = 0.1;//(isFixed) ? 3 : 0.1;

            var bodyDef = new Box2D.Dynamics.b2BodyDef();
            bodyDef.type = (isFixed) ? Box2D.Dynamics.b2Body.b2_staticBody : Box2D.Dynamics.b2Body.b2_dynamicBody;

            fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
            fixtureDef.shape.SetAsBox( width, height );

            var body = this._world.CreateBody( bodyDef );
            body.SetPositionAndAngle( new Box2D.Common.Math.b2Vec2(x, y), rotation );
            body.CreateFixture( fixtureDef );

            return body;
        },


        /**
         * Updates the game
         * Creates a WorldEntityDescription which it sends to NetChannel
         */
        update: function() {
            var delta = 16 / 1000;
            this.step( delta );
        },


        step: function( delta ) {
            this._world.Step(delta, delta * this._velocityIterationsPerSecond, delta * this._positionIterationsPerSecond);

            if(this._debugDraw) {
                this._world.DrawDebugData();
            }
            this._world.ClearForces();
        },

        /**
         * Setup the canvas used for debugging
         * @param {HTMLCanvasElement} canvas
         */
        setDebugDraw: function(canvas) {
            if( !canvas ) {
                var container = document.createElement( 'div' );
                container.style.position = "absolute";
                container.style.top = "305px";
                container.style.backgroundColor = "#000000";
                document.body.appendChild( container );

                var debugCanvas = document.createElement('canvas');
                container.appendChild( debugCanvas );

                canvas = debugCanvas;
                canvas.width = 1000;
                canvas.height = 500;
            }

            //setup debug draw
            var debugDraw = new b2DebugDraw();
            debugDraw.SetSprite( canvas.getContext("2d") );
            debugDraw.SetDrawScale(10);
            debugDraw.SetFillAlpha(0.3);
            debugDraw.SetLineThickness(0.5);
            debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
            debugDraw.offsetX = 0;
            debugDraw.offsetY = 15;

            this._world.SetDebugDraw(debugDraw);
            this._debugDraw = debugDraw;
        },

        /**
         * Set the offset of the debugDraw object - use this to scroll the debug draw
         * @param {Number} x
         * @param {Number} y
         */
        setDebugDrawOffset: function( x, y ) {
            if(!this._debugDraw) return;

            this._debugDraw.offsetX = x;
            this._debugDraw.offsetY = y;
        },

        /**
         * @return {Box2D.Dynamics.b2World}
         */
        getWorld: function() { return this._world; },

        /**
         * @return {Box2D.Dynamics.b2DebugDraw}
         */
        getDebugDraw: function() { return this._debugDraw; }
    };
})();