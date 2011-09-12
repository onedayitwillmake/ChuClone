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

		/**
		 * JSON String representation of level
		 * @type {String}
		 */
		levelJSONString: null,

		/**
		 * JSON Object representing the level
		 * @type {Object}
		 */
		levelJSON: null,

		/**
		 * Listen for respawn points
		 */
        setupEvents: function() {
            var that = this;
        },

        /**
         * Parses the current game world
         * @param {ChuClone.physics.WorldController} aWorldController
         * @param {String} aLevelName
         * @return {String} JSON String
         */
        parseLevel: function( aWorldController, aLevelName ) {
            var returnObject = {};
            var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;

            returnObject.editingInfo = {
                author: "#{user_name}",
                levelName: aLevelName,
                creationDate: this.creationDate || new Date().getTime(),
                modificationDate: new Date().getTime()
            };
            returnObject.worldSettings = {
                PTM_RATIO: ChuClone.model.Constants.PTM_RATIO
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
				if( !entity.getIsSavable() ) {
					continue;
				}

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
			this.levelJSONString = JSON.stringify( returnObject, null, "\t" );
			this.levelName = returnObject.editingInfo.levelName;

            return this.levelJSONString;
        },


        /**
         * Creates a level from a JSON string object adhering to the protocol defined in ChuClone.editor.LevelModel.parseLevel
         * @param {String}  aJsonString
         * @param {ChuClone.physics.WorldController} aWorldController
         * @param {ChuClone.GameViewController} aGameView
         */
        fromJsonString: function( aJsonString, aWorldController, aGameView ) {
			this.levelJSONString = aJsonString;
			this.levelJSON = JSON.parse(aJsonString);
            this.levelName = this.levelJSON.editingInfo.levelName;
            this.creationDate = this.levelJSON.editingInfo.creationDate;
            this.modificationDate = this.levelJSON.editingInfo.modificationDate;
            this.ptmRatio = this.levelJSON.worldSettings.PTM_RATIO;
            this.bodyList = [];
            ChuClone.model.Constants.PTM_RATIO = this.levelJSON.worldSettings.PTM_RATIO;

            var len = this.levelJSON.bodyList.length;
            // Create all Box2D bodies which contain an entity


            for(var i = 0; i < len; i++) {
                var entityInfo = this.levelJSON.bodyList[i];
                if( !this.checkLevelEntityInfoIsValid(entityInfo) ) continue;


				var modifier = 0.6; // Harmless modifier i use if i need to tweek ALL the pieces in a level like if i made the level too big


                var body = aWorldController.createRect(
                    entityInfo.x * this.ptmRatio * modifier,
                    entityInfo.y * this.ptmRatio * modifier,
                    entityInfo.angle,
                    entityInfo.dimensions.width * modifier,
                    entityInfo.dimensions.height * modifier,
                    entityInfo.physicsInfo.bodyType == Box2D.Dynamics.b2Body.b2_kinematicBody
                );



                var view = aGameView.createEntityView(
                    entityInfo.x*this.ptmRatio * modifier,
                    entityInfo.y*this.ptmRatio * modifier,
                    entityInfo.dimensions.width*2 * modifier,
                    entityInfo.dimensions.height*2 * modifier,
                    entityInfo.dimensions.depth*2);

                var entity = new ChuClone.GameEntity();
                entity.setBody( body );
                entity.setView( view );
                entity.setDimensions( entityInfo.dimensions.width * modifier, entityInfo.dimensions.height * modifier, entityInfo.dimensions.depth * modifier );

                // Attach all components in reverse order
                for(j = entityInfo.components.length - 1; j >= 0 ; j--) {
                    /**
                     * Use the factory to create the components
                     * @type {ChuClone.components.BaseComponent}
                     */
                    var componentInstance = ChuClone.components.ComponentFactory.getComponentByName( entityInfo.components[j].displayName );
                    if(!componentInstance) continue;
                    // Allow the component to set any special properties
                    componentInstance.fromModel( entityInfo.components[j], entity );
                    entity.addComponentAndExecute( componentInstance ); // Attach it to the entity
                }

                this.bodyList.push( body );
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

			for(var j = aLevelEntityInfo.components.length - 1; j >= 0 ; j--) {
				if( aLevelEntityInfo.components[j].displayName == "CharacterControllerComponent")
					isValid = false;
			}
            
            //... SOME OTHER CHECKS HERE
            return isValid;
        },

		/**
		 * Returns true if portal guns are allowed in the level
		 * This check is done by seeing if the character had a portalgun when the level was created
		 */
		allowsPortalGun:  function () {
			var len = this.levelJSON.bodyList.length;
			for (var i = 0; i < len; i++) {
				var entityInfo = this.levelJSON.bodyList[i];
				for (var j = entityInfo.components.length - 1; j >= 0; j--) {
					if (entityInfo.components[j].displayName == ChuClone.components.player.PortalGunComponent.prototype.displayName) {
						return true;
					}
				}
			}
		}
	}
})();