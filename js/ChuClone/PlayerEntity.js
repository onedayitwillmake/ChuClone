(function() {
    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    ChuClone.namespace("ChuClone");

    ChuClone.PlayerEntity = function() {
        ChuClone.PlayerEntity.superclass.constructor.call(this);
        this.addComponentAndExecute( new ChuClone.components.CharacterControllerComponent() );
        this.dispatchCreatedEvent();
    };

    ChuClone.PlayerEntity.prototype = {
        eventEmitter: new EventEmitter(),
        EVENTS: {
            CREATED: "created",
            DIED:   "died"
        },


        /**
         * Dispatches the created event via timeout so that it can be called the next 'frame'
         */
        dispatchCreatedEvent: function() {
            var that = this;
            setTimeout(function(){
                ChuClone.PlayerEntity.prototype.eventEmitter.emit( ChuClone.PlayerEntity.prototype.EVENTS.CREATED, that);
            }, 16);
        }
    };

    ChuClone.extend( ChuClone.PlayerEntity, ChuClone.GameEntity, null );
})();