/**
 * ChueClone Main
 * Mario Gonzalez
 * http://ribbonpaint.com
 */
(function(){
    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    ChuClone.namespace("ChuClone");
    ChuClone.ChuCloneGame = function() {
        this.entities = [];
        this.listenForReady();
    };

    ChuClone.ChuCloneGame.prototype = {
        view: null,

        /**
         * @type {ChuClone.WorldController}
         */
        worldController: null,

        /**
         * @type {ChuClone.GameEntity}
         */
        player      : null,

        listenForReady: function() {
            var that = this;
            window.addEventListener('DOMContentLoaded', function(e){that.onReady()}, true);
        },

        onReady: function() {
            this.setupView();
            this.setupWorldController();
            this.setup();
            this.setupKeyboard();
            this.setupPlayer();

            // MAIN LOOP
            var that = this;
            (function loop() {
                that.update();
                window.requestAnimationFrame( loop, null );
            })();
        },

        setupKeyboard: function() {
            var that = this;

            document.addEventListener('keydown', function(e) {
                that.player.handleKeyDown( e );


                // SPACEBAR
                if(e.keyCode == 32) {
                    var playerPosition = new Box2D.Common.Math.b2Vec2(that.player.getBody().GetPosition().x, that.player.getBody().GetPosition().y);
                    playerPosition.y += 60/PTM_RATIO;
                    var size = 1/ChuClone.Constants.PTM_RATIO;
                    var aabb = new Box2D.Collision.b2AABB();
                    aabb.lowerBound.Set( playerPosition.x - size, playerPosition.y - size );
                    aabb.upperBound.Set( playerPosition.x + size, playerPosition.y + size );


                    var selectedBody = null;
                    that.worldController.getWorld().QueryAABB(function getBodyCB(fixture) {
                        if (fixture.GetBody().GetType() == Box2D.Dynamics.b2Body.b2_dynamicBody) {
                            if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), playerPosition)) {
                                selectedBody = fixture.GetBody();
                                return false;
                            }
                        }
                        return false;
                    }, aabb);


                    if(!selectedBody) return;
                    var bodyPosition = selectedBody.GetPosition();

//				var prismaticJoint = new Box2D.Dynamics.b2PrismaticJointDef();
//				prismaticJoint.Initialize( body)
                    var impulse = new Box2D.Common.Math.b2Vec2(0, -20* selectedBody.GetMass());
                    //   impulse.y = 0;//force.y;
                    selectedBody.ApplyImpulse( impulse, bodyPosition );

                }
            }, false);

            document.addEventListener("keyup", function(e){
                that.player.handleKeyUp(e);
            }, true);
        },

        setupView: function() {
            this.view = new ChuClone.GameView();
        },

        setupWorldController: function() {
            this.worldController = new ChuClone.WorldController();
            this.worldController.setupEditor( this.view );
        },

        setup: function() {
            return;
            var boxSize = 30;
            for ( var i = 0; i < 100; i ++ ) {
                if(i > 0 && Math.random() < 0.1 ) continue; // Random skip

                var x = i*(boxSize* 8 * 2);
                var y = Math.abs(Math.sin(i/10))*-150 + Math.random() * 200 + 300
                var w = boxSize * 3 * 2;
                var h = boxSize;
                var body = this.worldController.createRect( x, y, 0, w, h, true );
                var view = this.view.createEntityView( x, y, w*2, h*2, 1000  );
                var entity = new ChuClone.GameEntity();
                entity.setBody( body );
                entity.setView( view );
                entity.setDimensions( w, h);

                this.entities.push( entity );
                this.view.addEntity( entity.view );
            }
        },

        setupPlayer: function() {
            var x = 600;
            var y = -200;
            var boxSize = 30;
            var body = this.worldController.createRect( x, y, Math.random() * 6, boxSize, boxSize, false);
            var view = this.view.createEntityView( x, y, boxSize * 2, boxSize*2, boxSize * 2);
            view.materials[0] = new THREE.MeshPhongMaterial( { ambient: 0x111111, color: 0x666666, specular: 0xDDDDDD, shininess:1, shading: THREE.FlatShading } );

            var entity = new ChuClone.PlayerEntity();
            entity.setBody( body );
            entity.setView( view );

            this.entities.push( entity );
            this.view.addEntity( entity.view );
            this.player = entity;
        },

        update: function() {
            /**
             * @type {Box2D.Dynamics.b2Body}
             */
            var node = this.worldController.getWorld().GetBodyList();
            while(node) {
                var b = node;
                node = node.GetNext();
//
                /**
                 * @type {ChuClone.GameEntity}
                 */
                var entity = b.GetUserData();
                if(entity)
                    entity.update();
//
            }

            if( this.player ) {
//                this.worldController.setDebugDrawOffset( -this.player.getBody().GetPosition().x+25, 5);
                this.worldController.update();
            }


//            this.view.camera.target.position = this.player.view.position;
//            this.view.camera.position.x = this.player.view.position.x - 700;
//            this.view.render();
        }
    };
}());
