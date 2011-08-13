/**
File:
	TitleScreenState.js|
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	Gameplaying state
 
 Basic Usage:

 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";

	ChuClone.namespace("ChuClone.states");

	ChuClone.states.TitleScreenState = function() {
		ChuClone.states.TitleScreenState.superclass.constructor.call(this);
		this._tweenList = [];
	};

	ChuClone.states.TitleScreenState.prototype = {
		/**
		 * @type {THREE.Camera}
		 */
		_camera: null,

		/**
         * @type {ChuClone.GameEntity}
         */
        _player         : null,

		/**
		 * Store all tweens in here for removal on exit
		 */
		_tweenList: null,

        /**
         * @type {Array}    Array of our extra mesh items
         */
        _backgroundElements: [],

		/**
		 * When the game is created, it might create a TitleScreenState.
		 * However if at any time a level is loaded, we listen for that and remove ourselves if _hasShown is true
		 * @type {Boolean}
		 */
		_hasShown: false,

		propProxy: {targetX: 6800, targetY: -400, targetZ: -8000, posX: 9000, posY: 4400, posZ: 3400},

        /**
		 * @inheritDoc
		 */
		enter: function() {
			ChuClone.states.TitleScreenState.superclass.enter.call(this);
			ChuClone.states.PlayLevelState.prototype.removeEditContainer.call( this );
		},

        /**
         * Setup the GUI instance
         */
		setupGUI: function() {
			var camera = this._gameView.getCamera();
			return;
			this._gui = new DAT.GUI({width: ChuClone.model.Constants.EDITOR.PANEL_WIDTH+20});


			var maxRadius = 20000;
			camera.target.position = new THREE.Vector3(this.propProxy.targetX, this.propProxy.targetY, this.propProxy.targetZ);
			camera.position = new THREE.Vector3(this.propProxy.posX, this.propProxy.posY, this.propProxy.posZ);
			this._gui.add(this.propProxy, 'targetX').min(-maxRadius).max(maxRadius);
			this._gui.add(this.propProxy, 'targetY').min(-maxRadius).max(maxRadius);
			this._gui.add(this.propProxy, 'targetZ').min(-maxRadius).max(maxRadius);

			this._gui.add(this.propProxy, 'posX').min(-maxRadius).max(maxRadius);
			this._gui.add(this.propProxy, 'posY').min(-maxRadius).max(maxRadius);
			this._gui.add(this.propProxy, 'posZ').min(-maxRadius).max(maxRadius);
		},

		/**
		 * Setup events related to this state
		 */
        setupEvents: function() {
            var that = this;
            this.addListener( ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_CREATED, function( aLevelManager ) { that.onLevelLoaded( aLevelManager ) } );
            this.addListener( ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_DESTROYED, function( aLevelManager ) { that.onLevelDestroyed( aLevelManager ) } );
            this.addListener( ChuClone.components.player.CharacterControllerComponent.prototype.EVENTS.CREATED, function( aPlayer ) { that.onPlayerCreated(aPlayer) } );
            this.addListener( ChuClone.components.player.CharacterControllerComponent.prototype.EVENTS.REMOVED, function( aPlayer ) { that.onPlayerDestroyed(aPlayer) } );
            this.addListener( ChuClone.components.GoalPadComponent.prototype.EVENTS.GOAL_REACHED, function( aGoalPad ) { that.onGoalReached( aGoalPad ) } );
        },


		/**
		 * Animate title blocks in
		 */
		animateIn: function() {

			for(var j = 0; j < 50; j++ ) {
				var width = Math.random() * 100;
				var height = Math.random() * 100;
				var depth = Math.random() * 100 * 2;
				var geometry = new THREE.CubeGeometry( width, height, depth );
				var mesh = new THREE.Mesh( geometry, [new THREE.MeshLambertMaterial( {
					color: 0xFFFFFF, shading: THREE.SmoothShading,
					map : THREE.ImageUtils.loadTexture( ChuClone.model.Constants.SERVER.ASSET_PREFIX + "assets/images/game/floor.png" )
				})] );
				mesh.dynamic = false;
				mesh.position.x = this._camera.position.x + ChuClone.utils.randFloat(1000, 14000);
				mesh.position.y = this._camera.position.y + ChuClone.utils.randFloat(-2000, 3500);
				mesh.position.z = this._camera.position.z - ChuClone.utils.randFloat(1000, 4000);

                this._backgroundElements.push( mesh );
				this._gameView.addObjectToScene( mesh );
			}
          
			// Animate all bodys that have a corresponding entity
			/**
             * @type {Box2D.Dynamics.b2Body}
             */
            var node = this._worldController.getWorld().GetBodyList();
			var i = 0;
            while(node) {

				i++;
                b = node;
                node = node.GetNext();


				/**
				 * @type {ChuClone.GameEntity}
				 */
				var entity = b.GetUserData();
				if (!(entity instanceof ChuClone.GameEntity) ) continue;
				if( entity.getComponentWithName(ChuClone.components.player.CharacterControllerComponent.prototype.displayName) ) continue;
				entity.getView().visible = false;


                if( i > 5000 ) {


                    var b = entity.getBody();
                    if (!entity) {
                        this._worldController.getWorld().DestroyBody(b);
                        continue;
                    }

                    if ("getView" in entity) {
                        this._gameView.removeObjectFromScene(entity.getView());
                    }

                    if ("dealloc" in entity) {
                        entity.dealloc();
                    }

                    this._worldController.getWorld().DestroyBody(b);
                    continue;
                }


				//if( Math.random() < 0.5 ) {
					var birdComponent = new ChuClone.components.effect.BirdEmitterComponent();
					birdComponent._count = 1;
					entity.addComponentAndExecute( birdComponent );
				//}


				var end = b.GetPosition();
				var start = {x: end.x + ChuClone.utils.randFloat(-100, 100), y: end.y + ChuClone.utils.randFloat(-100, 100), z: ChuClone.utils.randFloat(-10000, 10000) };
				var end = {x: b.GetPosition().x, y: b.GetPosition().y, z: 0};
				var prop = {target: b, entity: entity.getView(), x: start.x, y: start.y, z: start.z};

				b.SetPosition(new Box2D.Common.Math.b2Vec2(start.x, start.y))
				entity.getView().position.z = start.z;
				entity.getView().visible = true;
				var tween = new TWEEN.Tween(prop)
						.to({x: end.x, y: end.y, z: end.z}, 2000)
						.delay(Math.random() * 1000 + 500)
						.onUpdate(function() {
							this.target.SetPosition(new Box2D.Common.Math.b2Vec2(this.x, this.y));
							this.entity.position.z = this.z;
						})
						.easing(TWEEN.Easing.Sinusoidal.EaseInOut)
						.start();

				var tweenBack = new TWEEN.Tween(prop)
						.to({x: start.x, y: start.y, z: start.z }, 1000)
						.delay(6000 + Math.random() * 20000)
						.onUpdate(function() {
							this.target.SetPosition(new Box2D.Common.Math.b2Vec2(this.x, this.y))
							this.target.GetUserData().getView().position.z = this.z
						})
						.easing(TWEEN.Easing.Back.EaseOut);

				tween.chain(tweenBack);
				tweenBack.chain(tween);

				this._tweenList.push(tween, tweenBack);
			}
		},

        /**
         * @inheritDoc
         */
        update: function() {
            ChuClone.states.TitleScreenState.superclass.update.call(this);

			// Position camera
			if( this._camera ) {
				this._camera.target.position = new THREE.Vector3(this.propProxy.targetX, this.propProxy.targetY, this.propProxy.targetZ);
				this._camera.position = new THREE.Vector3(this.propProxy.posX, this.propProxy.posY, this.propProxy.posZ);
			}

			this.updatePhysics();
            this._gameView.update( this._currentTime );
            this._worldController.update();
        },

        /**
		 * Called when a goal is hit
		 * @param {ChuClone.editor.LevelManager} aLevelManager
		 */
		onLevelLoaded: function( aLevelManager ) {
			if(this._hasShown) {
				this.pushPlayLevelState();
				return;
			}
			this._hasShown = true;
            this.setupCamera();
            this._worldController.createBox2dWorld();
			this.animateIn();
		},

        /**
         * Called when our title screen is destroyed
         * @param aLevelManager
         */
		onLevelDestroyed: function(aLevelManager) {
            var len = this._tweenList.length;
            for (var i = 0; i < len; i++) {
                TWEEN.remove(this._tweenList[i]);
            }
            this._tweenList = [];

            len = this._backgroundElements.length;
            for (i = 0; i < len; i++) {
                this._gameView.removeObjectFromScene(this._backgroundElements[i]);
            }
            this._backgroundElements = [];
		},

        /**
		 * Sets up the camera
		 */
		setupCamera: function() {
			// Attach a few gameplay related components to the camera
			this._camera = this._gameView.getCamera();

			// Allow rotation about target
			this._camera.target.position = new THREE.Vector3(0, 100, 0);

			var focusComponent = new ChuClone.components.camera.CameraFocusRadiusComponent();
			this._camera.addComponentAndExecute(focusComponent);
			focusComponent.getRadius().x = 2000;
			focusComponent.getRadius().y = -1000;
			focusComponent.getRadius().z = 1000;

			this.setupGUI();

		},

		/**
		 * We dont want a player object, but its part of all levels, so we'll just get rid of it when its loaded
		 * @param aPlayer
		 */
        onPlayerCreated: function( aPlayer ) {
            this._gameView.removeObjectFromScene( aPlayer.getView() );

            var playerbody = aPlayer.getBody();
            aPlayer.dealloc();
            this._worldController.getWorld().DestroyBody( playerbody );
        },

        onPlayerDestroyed: function( aPlayer ) {

        },

		/**
		 * If we're running, and a level is loaded - start the play level state
		 */
		pushPlayLevelState: function() {
			this._gameView.getCamera().removeComponentWithName( ChuClone.components.camera.CameraFocusRadiusComponent.prototype.displayName );

			/**
			 * @type {ChuClone.states.PlayLevelState}
			 */
			var playLevelState = new ChuClone.states.PlayLevelState();
			playLevelState._gameView = this._gameView;
			playLevelState._worldController = this._worldController;
			playLevelState.onLevelLoaded();
			ChuClone.model.FSM.StateMachine.getInstance().changeState(playLevelState);
		},

        /**
         * @inheritDoc
         */
        exit: function() {

			if( this._tweenList ) {
				var len = this._tweenList.length;
				for(var i = 0; i < len; i++) {
					TWEEN.remove( this._tweenList[i] );
				}
				this._tweenList = null;
			}

            if( this._backgroundElements ) {
                len = this._backgroundElements.length;
                for (i = 0; i < len; i++) {
                    this._gameView.removeObjectFromScene(this._backgroundElements[i]);
                }
                this._backgroundElements = [];
            }

            ChuClone.states.TitleScreenState.superclass.exit.call(this);
			this.removeAllListeners();
        },

        /**
         * @inheritDoc
         */
        dealloc: function() {
			this._player = null;
			ChuClone.states.TitleScreenState.superclass.dealloc.call(this);
        }
	};

    ChuClone.extend( ChuClone.states.TitleScreenState, ChuClone.states.ChuCloneBaseState);
})();