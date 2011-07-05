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
         * @type {String}
         */
        levelName: null,

        /**
         * @type {Array}
         */
        bodyList: null,

        /**
         * Parses the current game world
         * @param {ChuClone.physics.WorldController} aWorldController
         * @param {String} aLevelName
         * @return {JSON}
         */
        parseLevel: function( aWorldController, aLevelName ) {
            var returnObject = {};
            var PTM_RATIO = ChuClone.Constants.PTM_RATIO;

            returnObject.editingInfo = {
                author: "mario gonzalez",
                levelName: aLevelName,
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
                    restitution: b.GetFixtureList().GetRestitution(),
                    bodyType: b.GetType()
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
         * @param {String}  aJsonString
         * @param {ChuClone.physics.WorldController} aWorldController
         * @param {ChuClone.GameView} aGameView
         */
        fromJson: function( aJsonString, aWorldController, aGameView ) {
            var levelObject = JSON.parse(aJsonString);
//            console.log(levelObject)
            this.author = levelObject.editingInfo.author;
            this.creationDate = levelObject.editingInfo.creationDate;
            this.modificationDate = levelObject.editingInfo.modificationDate;
            this.ptmRatio = levelObject.worldSettings.PTM_RATIO;
            ChuClone.Constants.PTM_RATIO = levelObject.worldSettings.PTM_RATIO;

            var len = levelObject.bodyList.length;
            // Create all Box2D bodies which contain an entity
            for(var i = 0; i < len; i++) {
                var entityInfo = levelObject.bodyList[i];
                if( !this.checkLevelEntityInfoIsValid(entityInfo) ) continue;

                var body = aWorldController.createRect(
                    entityInfo.x * this.ptmRatio,
                    entityInfo.y * this.ptmRatio,
                    entityInfo.angle,
                    entityInfo.dimensions.width,
                    entityInfo.dimensions.height,
                    entityInfo.physicsInfo.bodyType == Box2D.Dynamics.b2Body.b2_staticBody
                );

                var view = aGameView.createEntityView( x*this.ptmRatio,
                    entityInfo.y*this.ptmRatio,
                    entityInfo.dimensions.width*2,
                    entityInfo.dimensions.height*2,
                    entityInfo.dimensions.depth*2);

                var entity = new ChuClone.GameEntity();
                entity.setBody( body );
                entity.setView( view );
                entity.setDimensions( entityInfo.dimensions.width, entityInfo.dimensions.height, entityInfo.dimensions.depth );

                aGameView.addEntity( entity.view );
            }
        },

        /**
         * Checks to see if an entity is valid
         * @param {Object}  aLevelEntityInfo object containing information about this entity
         * @return {Boolean}
         */
        checkLevelEntityInfoIsValid: function( aLevelEntityInfo ) {
            var isValid = true;
            if( aLevelEntityInfo.dimensions.width == 0) isValid = false;
            
            //... SOME OTHER CHECKS HERE
            return isValid;
        }
    };
})();