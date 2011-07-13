(function(){
    ChuClone.namespace("ChuClone.model.FSM");
    ChuClone.model.FSM.StateMachine = function() {

    };

    ChuClone.model.FSM.StateMachine.prototype = {

        /**
         * @type {ChuClone.model.FSM.State}
         */
        _currentState: null,
        /**
         * @type {ChuClone.model.FSM.State}
         */
        _previousState: null,
        /**
         * @type {ChuClone.model.FSM.State}
         */
        _nextState: null,

        /**
         * Set the first state (without making call to previous state)
         * @param {ChuClone.model.FSM.State}
         */
        setInitialState: function( aState ) {
            this._currentState = aState;
            this._currentState.enter();
        },

        /**
         * Switch to another state
         * @param {ChuClone.model.FSM.State} aState
         */
        changeState: function( aState ) {
            this._currentState.exit();
            this._previousState = this._currentState;

            this._currentState = aState;
            this._currentState.enter();
        },

        /**
         * Switch to previous state
         */
        gotoPreviousState: function() {
            this.changeState( this._previousState );
        },

        /**
         * Switches to the next state
         */
        gotoNextState: function() {
            this.changeState( this._nextState );
        },

        /**
         * Update the current state
         */
        update: function() {
            if( this._currentState ) {
                this._currentState.update();
            }
        }
    }
})();