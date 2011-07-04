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
        parseLevel: function( aWorldController ) {
            var returnObject = {};
            var PTM_RATIO = ChuClone.Constants.PTM_RATIO;

            returnObject.editingInfo = {
                author: "mario gonzalez",
                creationDate: this.creationDate || new Date().getTime(),
                modificationDate: new Date().getTime()
            };
            returnObject.worldSettings = {
                PTM_RATIO: ChuClone.Constants.PTM_RATIO
            };

            returnObject.playerInfo = null;
            returnObject.bodyList = [];

            var node = aWorldController.getWorld().GetBodyList();
            while(node) {
                var b = node;
                node = node.GetNext();

                // The last object in the world list doesn't seem to have a fixture
                // I think it's a reference to the b2World itself???
                if( !b.GetFixtureList() ) {
                    continue;
                }
                var physicsInfo = {
                    density: b.GetFixtureList().GetDensity(),
                    friction: b.GetFixtureList().GetDensity(),
                    restitution: b.GetFixtureList().GetRestitution()
                };

                /**
                 * @type {ChuClone.GameEntity}
                 */
                var entity = b.GetUserData();
                if(!entity) continue;

                var entityInfo = {
                    x: b.GetPosition().x,
                    y: b.GetPosition().y,
                    dimensions: entity.getDimensions(),
                    angle: b.GetAngle(),
                    physicsInfo: physicsInfo
                };

                entityInfo.components = [];

                var i = entity.components.length;
                while (i--) {
                    entityInfo.components.push( entity.components[i].getModel() );
                }


                returnObject.bodyList.push( entityInfo );
            }

            
            return JSON.stringify( returnObject );
        },


        /**
         * Creates a level from a JSON string object adhering to the protocol defined in ChuClone.editor.LevelModel.parseLevel
         * @param {ChuClone.WorldController} aWorldController
         * @param {ChuClone.GameView} aGameView
         */
        fromJson: function( aWorldController, aGameView ) {

        }



    };
})();