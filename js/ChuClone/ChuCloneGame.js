/**
 * ChueClone Main
 * Mario Gonzalez
 * http://ribbonpaint.com
 */
(function(){
    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    ChuClone.namespace("ChuClone");
    ChuClone.ChuCloneGame = function() {
        this.listenForReady();
    };

    ChuClone.ChuCloneGame.prototype = {
        view: null,

        /**
         * @type {ChuClone.physics.WorldController}
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
            this.setupDebug();
            this.setupPlayer();

            // MAIN LOOP
            var that = this;
            (function loop() {
                that.update();
                window.requestAnimationFrame( loop, null );
            })();
        },

        setupView: function() {
            this.view = new ChuClone.GameView();
        },

        setupWorldController: function() {
            this.worldController = new ChuClone.physics.WorldController();
            this.worldController.setupEditor( this.view );
        },

        setupDebug: function() {
            return;
            for ( var i = 0; i < 100; i ++ ) {
                var w = Math.random() * 300 + 200;
                var h = Math.random() * 300;

                var x = i*(w*2);
                var y = i*h;//Math.abs(Math.sin(i/10))*-150 + Math.random() * 200 + 300;
                var body = this.worldController.createRect( x, y, 0, w, h, true );
                var view = this.view.createEntityView( x, y, w*2, h*2, 500  );
                var entity = new ChuClone.GameEntity();
                entity.setBody( body );
                entity.setView( view );
                entity.setDimensions( w, h, 1000 );

                this.view.addEntity( entity.view );
            }
        },

        setupPlayer: function() {
            var x = 0;
            var y = -300;
            var boxSize = 30;
            var body = this.worldController.createRect( x, y, Math.random() * 6, boxSize, boxSize, false);
            var view = this.view.createEntityView( x, y, boxSize * 2, boxSize*2, boxSize * 2);
            view.materials[0] = new THREE.MeshPhongMaterial( { ambient: 0x111111, color: 0x666666, specular: 0xDDDDDD, shininess:1, shading: THREE.FlatShading } );

            var entity = new ChuClone.PlayerEntity();
            entity.setBody( body );
            entity.setView( view );

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
                /**
                 * @type {ChuClone.GameEntity}
                 */
                var entity = b.GetUserData();
                if(entity)
                    entity.update();
            }

            if( this.player ) {
//                this.worldController.setDebugDrawOffset( -this.player.getBody().GetPosition().x+25, 5);
                this.worldController.update();
            }


            if (this.player.getView()) {
//                this.view.camera.target.position.x = this.player.view.position.x;
//                this.view.camera.target.position.y = this.player.view.position.y;
//                this.view.camera.target.position.z = this.player.view.position.z;
//                this.view.camera.position.x = this.player.view.position.x - 700;
            }
            this.view.render();
        }
    };
}());
