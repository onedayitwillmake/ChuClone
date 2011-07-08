
// This class is just a singleton proxy for an event emitter instnace
(function(){
    "use strict";
    ChuClone.namespace("ChuClone.Events.Dispatcher");
    ChuClone.Events.Dispatcher = new EventEmitter();
})();