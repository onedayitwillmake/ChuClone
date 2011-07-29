(function(){
    ChuClone.namespace("ChuClone.model.FSM");
    ChuClone.model.FSM.State = function() {
		this._closures = {};
    };

    ChuClone.model.FSM.State.prototype = {

        /**
         * Container of closures used in event callbacks
         * @type {Object}
         */
        _closures   : null,

        enter: function() {

        },

        update: function() {

        },

        exit: function() {

        },

        /**
         * Helper function for states to create a removable event binding
         * @param {String} eventName Name of the event to assign the listener to
         * @param {Function} listener Function to be executed when the specified event is emitted
         */
        addListener: function( eventName, listener ) {
			console.log("Adding Listener:", eventName);

            listener.eventName = eventName;
            this._closures[ eventName ] = listener;
            ChuClone.Events.Dispatcher.addListener(eventName, listener);
        },

        /**
         * Helper function for states to remove an event binding.
         * Assumes this._closures[eventName] is a valid object.
         * @param eventName
         */
        removeListener: function( eventName ) {
            ChuClone.Events.Dispatcher.removeListener( eventName, this._closures[eventName] );
        },

		/**
		 * Removes all listeners
		 */
		removeAllListeners: function() {
			for( var eventName in this._closures ) {
				console.log("Removing Listener:", eventName);
				this.removeListener( eventName );
			}
		}
    }
})();