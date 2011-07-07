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
        this.setupEvents();
    };

    ChuClone.ChuCloneGame.prototype = {
        view: null,

        /**
         * @type {ChuClone.physics.WorldController}
         */
        _worldController: null,

        /**
         * @type {ChuClone.editor.LevelManager}
         */
        _levelManager: null,

        /**
         * @type {ChuClone.PlayerEntity}
         */
        _player         : null,

        /**
         * Container of closures used in event callbacks
         * @type {Object}
         */
        _closures   : {},

        setupEvents: function() {
            var that = this;

            
            ChuClone.PlayerEntity.prototype.eventEmitter.addListener(ChuClone.PlayerEntity.prototype.EVENTS.CREATED, function( aPlayer ) {
                that.onPlayerCreated( aPlayer );
            });

            ChuClone.editor.LevelManager.prototype.EMITTER.addListener(ChuClone.Constants.STANDARD_EVENTS.CREATED, function( aLevelModel ) {
                that._worldController.createBox2dWorld();
            });
        },

        /**
         * Sets up the LevelManager
         */
        setupLevelManager: function() {
            this._levelManager = new ChuClone.editor.LevelManager( this._worldController, this._gameView );
            this._levelManager.setupGui();
        },
        
        /**
         * Listens for DOMContentLoaded event
         */
        listenForReady: function() {
            var that = this;

            window.addEventListener('DOMContentLoaded', function callback(e){
                window.removeEventListener('DOMContentLoaded', callback, false);
                that.onReady()
            }, false);
        },

        /**
         * Dispatched when 'DOMContentLoaded' event is fired
         * @type {Event}    'DOMContentLoaded' event
         */
        onReady: function(e) {
            this.setupView();
            this.setupWorldController();
            this.setupLevelManager();
            this._levelManager.loadLevelFromURL("");


//            this.debugSetupRandomBlocks();
//            this.debugSetupPlayer();


            // MAIN LOOP
            var that = this;
            (function loop() {
                that.update();
                window.requestAnimationFrame( loop, null );
            })();
        },

        setupView: function() {
            this._gameView = new ChuClone.GameView();
            this._gameView.onResize( null );
        },

        setupWorldController: function() {
            this._worldController = new ChuClone.physics.WorldController();
            this._worldController.setupEditor( this.view );
        },

        debugSetupRandomBlocks: function() {
            for ( var i = 0; i < 100; i ++ ) {
                var w = Math.random() * 300 + 200;
                var h = Math.random() * 300;

                var x = i*(w*2);
                var y = i*h;//Math.abs(Math.sin(i/10))*-150 + Math.random() * 200 + 300;
                var body = this._worldController.createRect( x, y, 0, w, h, true );
                var view = this.view.createEntityView( x, y, w*2, h*2, 500  );
                var entity = new ChuClone.GameEntity();
                entity.setBody( body );
                entity.setView( view );
                entity.setDimensions( w, h, 1000 );

                this.view.addEntity( entity.view );
            }
        },

        debugSetupPlayer: function() {
            var x = 0;
            var y = -300;
            var boxSize = 30;
            var body = this._worldController.createRect( x, y, Math.random() * 6, boxSize, boxSize, false);
            var view = this.view.createEntityView( x, y, boxSize * 2, boxSize*2, boxSize * 2);
            view.materials[0] = new THREE.MeshPhongMaterial( { ambient: 0x111111, color: 0x666666, specular: 0xDDDDDD, shininess:1, shading: THREE.FlatShading } );

            var entity = new ChuClone.PlayerEntity();
            entity.setBody( body );
            entity.setView( view );

            this._gameView.addEntity( entity.view );
            this._player = entity;
        },

         /**
         * Dispatched when the player is created
         * @param aPlayer
         */
         onPlayerCreated: function(aPlayer) {
             var x = 50;
             var y = -300;

             aPlayer.getBody().SetPosition( new Box2D.Common.Math.b2Vec2(x / ChuClone.Constants.PTM_RATIO, y / ChuClone.Constants.PTM_RATIO) );
             aPlayer.getView().materials[0] = ChuClone.Constants.PLAYER.MATERIAL;
             aPlayer.setDimensions(ChuClone.Constants.PLAYER.WIDTH, ChuClone.Constants.PLAYER.HEIGHT, ChuClone.Constants.PLAYER.DEPTH);

             
             aPlayer.addComponentAndExecute( new ChuClone.components.CharacterControllerComponent() );
             this._player = aPlayer;
         },
        
        update: function() {
            /**
             * @type {Box2D.Dynamics.b2Body}
             */
            var node = this._worldController.getWorld().GetBodyList();
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

//            if( this.player ) {
//                this.worldController.setDebugDrawOffset( -this.player.getBody().GetPosition().x+25, 5);
                this._worldController.update(); 
//            }

            if (this._player && this._player.getView()) {
                this._gameView.camera.target.position.x = this._player.view.position.x + 700;
                this._gameView.camera.target.position.y = this._player.view.position.y - 100;
                this._gameView.camera.target.position.z = this._player.view.position.z;
                this._gameView.camera.position.x = this._player.view.position.x - 700;
            }
            this._gameView.render();
        }
    };
}());
