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
              var force = new Box2D.Common.Math.b2Vec2(0,0);
                switch(e.keyCode) {
                    case 37:
                        force.x = 1;
                    break;
                     case 39:
                        force.x = -1;
                    break;
                }

                var bodyPosition = that.player.body.GetPosition();
				var angle = Math.PI;//Math.atan2( pos.y - bodyPosition.y, pos.x - bodyPosition.x );
				var strength = 2000;
				var impulse = new Box2D.Common.Math.b2Vec2(3000, -5);
                impulse.x *= -force.x;
                that.player.body.ApplyImpulse( impulse, bodyPosition );
			}, false);

//            console.log(Math.cos(angle) * force, Math.sin(angle) * force)
//            this.player.applyForce( force );
        },

        setupView: function() {
            this.view = new ChuClone.GameView();
        },

        setupWorldController: function() {
            this.worldController = new ChuClone.WorldController();
        },

        setup: function() {

            var boxSize = 30;
            for ( var i = 0; i < 100; i ++ ) {
                var x = i*(boxSize);
                var y = Math.sin(i/10)*30;
                var body = this.worldController.createRect( x, y, 0, boxSize, boxSize, true );
                var view = this.view.createEntityView( x, y, boxSize*0.9, 2, 200  );
                var entity = new ChuClone.GameEntity();
                entity.setBody( body );
                entity.setView( view );

                this.entities.push( entity );
                this.view.addEntity( entity.view );
            }

            // Player-
            x = 21;
            y = 30;
            boxSize *= 1.5;
            body = this.worldController.createRect( x, y, 0, 5, 5, false);
            view = this.view.createEntityView( x, y, boxSize, boxSize, 20 );
            view.materials[0] = new THREE.MeshLambertMaterial( { color: 0xFF0000 } );
            entity = new ChuClone.GameEntity();
            entity.setBody( body );
            entity.setView( view );

            this.entities.push( entity );
            this.view.addEntity( entity.view );
            this.player = entity;
        },

        update: function() {
            for(var i = 0; i < this.entities.length; i++ ) {
                this.entities[i].update();
            }

            this.player.playerUpdate();
            this.worldController.update();
            this.view.camera.target.position = this.player.view.position;
            this.view.camera.position.x = this.player.view.position.x;
            this.view.render();
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
