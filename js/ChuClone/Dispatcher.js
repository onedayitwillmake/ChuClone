
// This class is just a singleton proxy for an event emitter instnace
(function(){
    ChuClone.namespace("ChuClone.Events.Dispatcher");
    ChuClone.Events.Dispatcher = new EventEmitter();
})();