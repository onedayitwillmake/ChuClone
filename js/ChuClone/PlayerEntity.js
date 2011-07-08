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
            DIED:   "PlayerEntity.event.died"
        },
        GROUP   : -1,

        /**
         * Dispatches the created event via timeout so that it can be called the next 'frame'
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
            
        }
    };

    ChuClone.extend( ChuClone.PlayerEntity, ChuClone.GameEntity );
})();