/**
 * RibbonPaintCanvas
 * Mario Gonzalez
 * http://ribbonpaint.com
 */
(function(){
    ChuClone.namespace("ChuClone");

    ChuClone.ChuCloneGame = function() {
        this.entities = [];
        this.listenForReady();
    };

    ChuClone.ChuCloneGame.prototype = {
        view: null,
        worldController: null,
        entities    :   [],
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

            var that = this;

            // Loop
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
                    var size = 10;
                    var aabb = new Box2D.Collision.b2AABB();
                    aabb.lowerBound.Set( playerPosition.x - size, playerPosition.y - size );
                    aabb.upperBound.Set( playerPosition.x + size, playerPosition.y + size );

                    var selectedBody = null;
                    that.worldController.getWorld().QueryAABB(function getBodyCB(fixture) {
                        console.log(fixture.GetBody() == that.player.getBody())
                        if (fixture.GetBody().GetType() != Box2D.Dynamics.b2Body.b2_dynamicBody) {
                            if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), playerPosition)) {
                                selectedBody = fixture.GetBody();
                                return false;
                            }
                        }
                        return false;
                    }, aabb);

                    if(!selectedBody) return;
                    console.log(selectedBody)
                    var bodyPosition = selectedBody.GetPosition();


                    var impulse = new Box2D.Common.Math.b2Vec2(0, -5000 * selectedBody.GetMass());
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
        },

        setup: function() {

            var boxSize = 30;
            for ( var i = 0; i < 30; i ++ ) {
                var x = i*(boxSize*2);
                var y = Math.abs(Math.sin(i/10))*-150 + 150;
                var body = this.worldController.createRect( x, y, 0, boxSize, boxSize, false );
                var view = this.view.createEntityView( x, y, boxSize*2, boxSize*2, 100  );
                var entity = new ChuClone.GameEntity();
                entity.setBody( body );
                entity.setView( view );

                this.entities.push( entity );
                this.view.addEntity( entity.view );
            }

            // Player-
            x = 600;
            y = -200;
            boxSize = 30;
            body = this.worldController.createRect( x, y, Math.random() * 6, boxSize, boxSize, false);
            view = this.view.createEntityView( x, y, boxSize * 2, boxSize*2, boxSize * 2);
            view.materials[0] = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.FlatShading } );
            entity = new ChuClone.PlayerEntity();
            entity.setBody( body );
            entity.setView( view );
//            body.ApplyImpulse( new Box2D.Dynamics.b2Vec2(1000, 0), body.GetPosition() );


            this.entities.push( entity );
            this.view.addEntity( entity.view );
            this.player = entity;
        },

        update: function() {
            for(var i = 0; i < this.entities.length; i++ ) {
                this.entities[i].update();
            }

            this.worldController.update();
            this.view.camera.target.position = this.player.view.position;
            this.view.camera.position.x = this.player.view.position.x;
//            this.view.render();
        }
    };

       /*
           var onLoad = function( event ) {
            // Create canvas element
            var canvas = document.createElement('canvas');
            canvas.id = "container";
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            document.body.insertBefore( canvas, document.getElementById("linklist") );

            var context = canvas.getContext("2d");
            var game = new ChuClone.ChuCloneGame();


        };
        */
}());
