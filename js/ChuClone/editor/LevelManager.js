(function(){
    ChuClone.namespace("ChuClone.editor");
    ChuClone.editor.LevelManager = function() {
    };

    ChuClone.editor.LevelManager.prototype = {
        /**
         * @type {Object}
         */
        _guiControllers    : {},

        setupGui: function() {
             // Creation gui
            this._gui = new DAT.GUI();
            this._gui.name("LevelManager");
            this._gui.autoListen = false;
//            this._controllers['onShouldCreate'] = this._guiCreation.add(this, 'onShouldCreate').name("Create Entity");
//            this._controllers['onShouldClone'] = this._guiCreation.add(this, 'onShouldCloneEntity').name("Clone Entity")
//            this._controllers['onShouldDelete'] = this._guiCreation.add(this, 'onShouldDelete').name("Destroy Entity");

            this._gui.close();
            this._gui.open();
        }
    }
})();