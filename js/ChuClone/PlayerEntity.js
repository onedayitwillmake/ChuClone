/**
 File:
    PlayerEntity.js
 Created By:
    Mario Gonzalez
 Project    :
    ChuClone
 Abstract:
    Slim class to separate or special 'player' gameentity from other 'regular' entities
 Basic Usage:
    var x = 0;
    var y = -300;
    var boxSize = 30;

    // Create a Physics body for this entity
    var body = this._worldController.createRect( x, y, 0, boxSize, boxSize, false);

    // Create a view for this entity
    var view = this.view.createEntityView( x, y, boxSize * 2, boxSize * 2, boxSize * 2);

    // Create the entity and attach the body and view
    var entity = new ChuClone.GameEntity();
    entity.setBody( body );
    entity.setView( view );

  License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function() {
    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    ChuClone.namespace("ChuClone");

    ChuClone.PlayerEntity = function() {
        ChuClone.PlayerEntity.superclass.constructor.call(this);
        this._type = ChuClone.Constants.ENTITY_TYPES.PLAYER;
        this.dispatchCreatedEvent();
    };

    ChuClone.PlayerEntity.prototype = {
        EVENTS: {
            CREATED: "PlayerEntity.event.created",
            REMOVED:   "PlayerEntity.event.removed"
        },
        GROUP   : -1,

        /**
         * Dispatches the created event via timeout so that it can be called the "next frame"
         */
        dispatchCreatedEvent: function() {
            var that = this;
            setTimeout(function(){
                ChuClone.Events.Dispatcher.emit( ChuClone.PlayerEntity.prototype.EVENTS.CREATED, that);
            }, 16);
        },

        /**
         * @inheritDoc
         */
        setBody: function( aBody ) {
            ChuClone.PlayerEntity.superclass.setBody.call( this, aBody );
            
            aBody.GetFixtureList().m_filter.groupIndex = ChuClone.PlayerEntity.prototype.GROUP;
//            aBody.GetFixtureList().categoryBits = ChuClone.Constants.PHYSICS.GROUPS.PLAYER;
//            aBody.GetFixtureList().maskBits = ChuClone.Constants.PHYSICS.GROUPS.PLATFORM;


//            aBody.GetFixtureList.filter.categoryBits = 0x0002;
            
        },

        /**
         * @inheritDoc
         */
        dealloc: function() {
            ChuClone.Events.Dispatcher.emit( ChuClone.PlayerEntity.prototype.EVENTS.REMOVED, this);
            ChuClone.PlayerEntity.superclass.dealloc.call(this);
        }
    };

    ChuClone.extend( ChuClone.PlayerEntity, ChuClone.GameEntity );
})();