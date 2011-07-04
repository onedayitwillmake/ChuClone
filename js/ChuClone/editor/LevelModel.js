(function(){
    ChuClone.namespace("ChuClone.editor");
    ChuClone.editor.LevelModel = function() {

    };

    ChuClone.editor.LevelModel.prototype = {
        /*
        levelmodel
	AUTHOR
	CREATION_DATE
	MODIFICATION_DATE
	PTM_RATIO
	bodyList
		body
			type - {RECTANGLE|TRIANGLE}
			x
			y
			w
			h
			density
			restitution
			friction
         */

        /**
         * @type {String}
         */
        author: null,

        /**
         * @type {Date}
         */
        creationDate: null,

        /**
         * @type {String}
         */
        modificationDate: null,

        /**
         * @type {Number}
         */
        ptmRatio: 1,

        /**
         * @type {Array}
         */
        bodyList: null,

        /**
         * Parses the current game world
         * @param {ChuClone.WorldController} aWorldController
         * @return {JSON}
         */
        parse: function( aWorldController ) {
            var object;

            return JSON.stringfy( return)
        }
    };
});