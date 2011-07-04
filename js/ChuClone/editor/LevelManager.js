(function(){
    ChuClone.namespace("ChuClone.editor");
    ChuClone.editor.LevelManager = function( aWorldController ) {
        this._worldController = aWorldController;
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
            this._controllers['loadLevel'] = this._gui.add(this, 'saveLevel').name("Load Level");

            this._gui.close();
            this._gui.open();
        },

        saveLevel: function() {
            var model = new ChuClone.editor.LevelModel();
            var data = model.parseLevel( this._worldController );

            var slot = "slot"+this._currentSlot;
            localStorage.setItem(slot, data);

            console.log( localStorage );
        },

        loadLevel: function() {
            var model = new ChuClone.editor.LevelModel();
            model.parseLevel( this._worldController );
        }
    }
})();