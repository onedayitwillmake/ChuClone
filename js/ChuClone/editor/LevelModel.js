/**
 File:
    ChuCloneGame.js
 Created By:
    Mario Gonzalez - mariogonzalez@gmail.com
 Project:
    ChuClone
 Abstract:
    This class represents a level in ChuClone, it knows how to parse a level from JSON, and convert one to JSON

 Data Structure:
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
 Basic Usage:

 Version:
    1.0

 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){

    var instance;

    ChuClone.namespace("ChuClone.editor");
    ChuClone.editor.LevelModel = function() {

        if(instance == null) {
            instance = this;
        }

        this.setupEvents();
    };

    ChuClone.editor.LevelModel.getInstance = function() {
        return instance;
    };

    ChuClone.editor.LevelModel.prototype = {
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

        respawnPoints: [],

        setupEvents: function() {

            // Listen for respawn points
            var that = this;
            ChuClone.Events.Dispatcher.addListener(ChuClone.components.RespawnComponent.prototype.EVENTS.CREATED, function( aRespawnPoint) { that.onRespawnPointCreated(aRespawnPoint); });
            ChuClone.Events.Dispatcher.addListener(ChuClone.components.RespawnComponent.prototype.EVENTS.DESTROYED, function( aRespawnPoint) { that.onRespawnPointDestroyed(aRespawnPoint); });
        },

        /**
         * Called when a respawn point is created
         * @param {ChuClone.components.RespawnComponent} aRespawnPoint
         */
        onRespawnPointCreated: function( aRespawnPoint ) {
            this.respawnPoints.push( aRespawnPoint );
        },


        /**
         * Called when a respawn point is destroyed, removes it from the respawnPoints array
         * This is usually called from from the editor
         * @param {ChuClone.components.RespawnComponent} aRespawnPoint
         */
        onRespawnPointDestroyed: function( aRespawnPoint ) {
            var respawnPointIndex = this.respawnPoints.indexOf(aRespawnPoint);
            if( respawnPointIndex === -1 ) return;
            
            this.respawnPoints.splice( respawnPointIndex, 1 );
        },

        /**
         * Parses the current game world
         * @param {ChuClone.physics.WorldController} aWorldController
         * @param {String} aLevelName
         * @return {String} JSON String
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
                    physicsInfo: physicsInfo,
                    entityType: entity.getType()
                };

                entityInfo.components = [];

                var i = entity.components.length;
                while (i--) {
                    entityInfo.components.push( entity.components[i].getModel() );
                }


                returnObject.bodyList.push( entityInfo );
            }


            //
            var aJSONString = JSON.stringify( returnObject, null, "\t" );
//            console.log( aJSONString );
            console.log( this.respawnPoints );
            return aJSONString;
        },


        /**
         * Creates a level from a JSON string object adhering to the protocol defined in ChuClone.editor.LevelModel.parseLevel
         * @param {String}  aJsonString
         * @param {ChuClone.physics.WorldController} aWorldController
         * @param {ChuClone.GameViewController} aGameView
         */
        fromJsonString: function( aJsonString, aWorldController, aGameView ) {
            var levelObject = JSON.parse(aJsonString);
            this.author = levelObject.editingInfo.author;
            this.levelName = levelObject.editingInfo.levelName;
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

                var view = aGameView.createEntityView(
                    entityInfo.x*this.ptmRatio,
                    entityInfo.y*this.ptmRatio,
                    entityInfo.dimensions.width*2,
                    entityInfo.dimensions.height*2,
                    entityInfo.dimensions.depth*2);

                // TODO: TEMP HACK - CHECK IF COMPONENTS > 1, ASSUME PLAYER
                var entity = (entityInfo.components.length > 1) ? new ChuClone.PlayerEntity() : new ChuClone.GameEntity();
                entity.setBody( body );
                entity.setView( view );
                entity.setDimensions( entityInfo.dimensions.width, entityInfo.dimensions.height, entityInfo.dimensions.depth );

                // Attach all components in reverse order
                for(var j = entityInfo.components.length - 1; j >= 0 ; j--) {
                    /**
                     * Use the factory to create the components
                     * @type {ChuClone.components.BaseComponent}
                     */
                    var componentInstance = ChuClone.components.ComponentFactory.getComponentByName( entityInfo.components[j].displayName );
                    if(!componentInstance) continue;
                    // Allow the component to set any special properties
                    componentInstance.fromModel( entityInfo.components[j] );
                    entity.addComponentAndExecute( componentInstance ); // Attach it to the entity
                }

//                aGameView.addEntity( entity.view );
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