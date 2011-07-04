(function(){
    ChuClone.namespace("ChuClone.editor");
    ChuClone.editor.LevelManager = function( aWorldController, aGameView ) {
        this._worldController = aWorldController;
        this._gameView = aGameView;
    };

    ChuClone.editor.LevelManager.prototype = {
        /**
         * @type {ChuClone.editor.LevelModel}
         */
        _levelModel        : null,
        /**
         * @type {ChuClone.WorldController}
         */
        _worldController    : null,
        /**
         * @type {ChuClone.GameView}
         */
        _gameView    : null,
        /**
         * @type {Object}
         */
        _controllers        : {},

        _currentSlot        : 0,
        _saveSlots          : null,

        setupGui: function() {
             // Creation gui
            this._gui = new DAT.GUI();
            this._gui.name("LevelManager");
            this._gui.autoListen = false;

            this._controllers['slot'] = this._gui.add(this, '_currentSlot').options(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10).name("Slot");
            this._controllers['saveLevel'] = this._gui.add(this, 'saveLevel').name("Save Level");
            this._controllers['loadLevel'] = this._gui.add(this, 'loadLevel').name("Load Level");

            this._gui.close();
            this._gui.open();
        },

        saveLevel: function() {
            var model = new ChuClone.editor.LevelModel();
            var data = model.parseLevel( this._worldController );

            var slot = "slot"+this._currentSlot;
            localStorage.setItem(slot, data);
        },

        loadLevel: function() {
            var model = new ChuClone.editor.LevelModel();
            var slot = "slot"+this._currentSlot;

            model.fromJson( localStorage.getItem(slot) );
            this.clearLevel();
        },

        clearLevel: function() {
            var node = this._worldController.getWorld().GetBodyList();
            while (node) {
                var b = node;
                node = node.GetNext();


                /**
                 * @type {ChuClone.GameEntity}
                 */
                var entity = b.GetUserData();
                if (!entity) {
                    this._worldController.getWorld().DestroyBody(b);
                    continue;
                }

                this._gameView.removeEntity( entity.getView() );
                entity.dealloc();
                this._worldController.getWorld().DestroyBody(b);
            }
        }
    }
})();