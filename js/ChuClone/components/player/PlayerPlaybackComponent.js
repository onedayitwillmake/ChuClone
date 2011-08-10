/**
File:
	PlayerPlaybackComponent.js
Created By:
	Mario Gonzalez
Project	:
	RealtimeMultiplayerNodeJS
Abstract:
 	Records a players keyboard state to enable playback of a level
 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";

	/**
	 * Stores current status of each key
	 * @type {Object}
	 */
	var KEY_STATES = {
		UP		: 1 << 1,
		DOWN	: 1 << 2,
		LEFT	: 1 << 3,
		RIGHT	: 1 << 4
	};
	
	ChuClone.namespace("ChuClone.components.player");

	ChuClone.components.player.PlayerPlaybackComponent = function() {
		ChuClone.components.player.PlayerPlaybackComponent.superclass.constructor.call(this);
		this.requiresUpdate = true;
		this._record = JSON.parse('[{"t":2705,"s":16},{"t":2822,"s":18},{"t":2889,"s":16},{"t":3490,"s":18},{"t":3706,"s":2},{"t":3740,"s":0},{"t":4657,"s":16},{"t":5158,"s":0},{"t":5575,"s":2},{"t":5775,"s":0},{"t":5926,"s":16},{"t":6877,"s":18},{"t":7078,"s":16},{"t":9616,"s":18},{"t":9783,"s":16},{"t":10317,"s":18},{"t":10468,"s":16},{"t":10568,"s":0},{"t":10752,"s":8},{"t":11480,"s":0},{"t":12197,"s":16},{"t":12281,"s":0},{"t":12881,"s":8},{"t":13014,"s":0},{"t":13131,"s":16},{"t":13197,"s":0},{"t":13581,"s":4},{"t":13698,"s":0},{"t":13815,"s":16},{"t":14348,"s":18},{"t":14532,"s":16},{"t":17868,"s":18},{"t":18068,"s":16},{"t":19653,"s":0},{"t":20771,"s":16},{"t":20955,"s":18},{"t":21139,"s":16},{"t":21757,"s":18},{"t":21890,"s":16},{"t":23761,"s":18},{"t":25147,"s":16},{"t":26015,"s":18},{"t":26683,"s":16},{"t":26967,"s":20},{"t":27084,"s":16},{"t":27718,"s":18},{"t":27869,"s":16},{"t":28937,"s":18},{"t":29038,"s":16},{"t":29088,"s":0},{"t":29155,"s":8},{"t":29472,"s":10},{"t":29956,"s":8},{"t":29991,"s":0},{"t":30023,"s":4},{"t":30140,"s":20},{"t":30190,"s":16},{"t":30992,"s":0},{"t":31359,"s":16},{"t":31492,"s":18},{"t":31643,"s":16},{"t":32480,"s":0},{"t":32731,"s":16},{"t":32798,"s":18},{"t":32964,"s":16},{"t":34449,"s":18},{"t":34566,"s":16},{"t":37805,"s":18},{"t":37922,"s":16},{"t":37922,"s":0},{"t":38106,"s":8},{"t":38557,"s":0},{"t":38707,"s":16},{"t":38774,"s":18},{"t":39008,"s":16},{"t":42147,"s":18},{"t":42331,"s":16},{"t":43316,"s":18},{"t":43517,"s":16},{"t":45637,"s":18},{"t":45754,"s":16},{"t":46806,"s":18},{"t":47992,"s":16},{"t":48043,"s":0},{"t":48293,"s":8},{"t":48376,"s":10},{"t":48477,"s":2},{"t":48544,"s":0},{"t":49044,"s":2},{"t":49194,"s":0},{"t":49211,"s":16},{"t":49512,"s":0},{"t":49812,"s":16},{"t":50046,"s":18},{"t":50180,"s":16},{"t":50313,"s":0},{"t":50731,"s":8},{"t":50864,"s":0},{"t":51398,"s":16},{"t":51933,"s":18},{"t":52033,"s":16},{"t":52250,"s":0},{"t":52801,"s":8},{"t":53269,"s":0},{"t":53419,"s":16},{"t":53703,"s":18},{"t":53803,"s":16},{"t":53953,"s":0},{"t":54438,"s":8},{"t":55173,"s":0},{"t":55306,"s":16},{"t":55674,"s":18},{"t":55741,"s":16},{"t":55907,"s":0},{"t":56459,"s":2},{"t":56676,"s":0},{"t":57177,"s":8},{"t":57644,"s":10},{"t":57878,"s":8},{"t":59047,"s":0},{"t":59080,"s":16},{"t":60917,"s":18},{"t":61051,"s":16},{"t":61268,"s":0},{"t":61435,"s":8},{"t":62237,"s":0},{"t":62338,"s":16},{"t":62574,"s":18},{"t":62755,"s":16},{"t":64658,"s":0},{"t":64792,"s":8},{"t":64909,"s":10},{"t":65493,"s":8},{"t":65576,"s":0},{"t":66261,"s":8},{"t":66378,"s":10},{"t":67230,"s":2},{"t":67247,"s":0},{"t":67280,"s":16},{"t":67981,"s":18},{"t":69467,"s":16},{"t":70971,"s":18},{"t":71405,"s":16},{"t":71438,"s":0},{"t":71605,"s":8},{"t":71906,"s":10},{"t":71922,"s":2},{"t":72039,"s":10},{"t":72089,"s":2},{"t":72306,"s":0},{"t":72423,"s":8},{"t":72874,"s":0},{"t":73058,"s":16},{"t":73459,"s":18},{"t":73609,"s":2},{"t":73659,"s":0},{"t":73776,"s":8},{"t":74060,"s":0},{"t":74277,"s":16},{"t":74427,"s":0},{"t":74667,"s":8},{"t":74850,"s":10},{"t":74950,"s":2},{"t":75033,"s":18},{"t":75033,"s":16},{"t":75734,"s":0},{"t":75884,"s":8},{"t":76235,"s":10},{"t":76284,"s":2},{"t":76451,"s":18},{"t":76485,"s":16},{"t":76818,"s":0},{"t":76902,"s":8},{"t":77819,"s":0},{"t":78453,"s":16},{"t":79554,"s":18},{"t":79688,"s":16},{"t":81892,"s":18},{"t":82076,"s":16},{"t":83195,"s":0},{"t":83462,"s":8},{"t":83546,"s":10},{"t":83662,"s":2},{"t":83679,"s":0},{"t":83879,"s":16},{"t":84013,"s":0},{"t":84096,"s":8},{"t":84230,"s":10},{"t":84413,"s":2},{"t":84413,"s":0},{"t":84547,"s":16},{"t":84631,"s":0},{"t":84965,"s":16},{"t":85032,"s":18},{"t":85249,"s":16},{"t":86134,"s":18},{"t":86234,"s":16},{"t":86619,"s":0},{"t":86885,"s":16},{"t":87336,"s":0},{"t":87920,"s":16},{"t":88038,"s":0},{"t":88973,"s":16},{"t":89156,"s":18},{"t":89306,"s":16},{"t":90659,"s":0},{"t":90693,"s":8},{"t":91227,"s":0},{"t":91244,"s":16},{"t":92347,"s":18},{"t":92447,"s":16},{"t":92797,"s":0},{"t":93299,"s":8},{"t":93532,"s":0},{"t":93666,"s":16},{"t":93733,"s":18},{"t":93833,"s":2},{"t":94017,"s":0},{"t":94751,"s":16},{"t":94901,"s":0},{"t":94951,"s":16},{"t":95786,"s":18},{"t":95953,"s":16},{"t":96738,"s":0},{"t":96805,"s":8},{"t":97339,"s":0},{"t":97389,"s":16},{"t":97723,"s":18},{"t":97907,"s":16},{"t":98809,"s":18},{"t":98926,"s":16},{"t":99059,"s":18},{"t":99226,"s":16},{"t":99410,"s":0},{"t":99677,"s":16},{"t":99894,"s":0},{"t":100011,"s":16},{"t":100545,"s":18},{"t":100779,"s":16},{"t":102082,"s":18},{"t":102165,"s":16},{"t":103401,"s":18},{"t":103535,"s":16},{"t":103735,"s":0},{"t":103819,"s":8},{"t":104169,"s":12},{"t":104286,"s":4},{"t":104303,"s":0},{"t":104370,"s":16},{"t":105104,"s":18},{"t":105272,"s":16},{"t":105722,"s":18},{"t":105856,"s":16},{"t":105923,"s":18},{"t":106056,"s":16},{"t":106825,"s":18},{"t":106925,"s":16},{"t":107009,"s":0},{"t":107075,"s":8},{"t":107309,"s":10},{"t":113137,"s":2},{"t":113171,"s":0},{"t":113237,"s":16},{"t":113872,"s":18},{"t":114240,"s":16},{"t":115592,"s":18},{"t":115759,"s":16},{"t":115909,"s":0},{"t":115960,"s":8},{"t":115960,"s":12},{"t":116159,"s":4},{"t":116159,"s":0},{"t":116210,"s":16},{"t":116511,"s":18},{"t":116644,"s":16},{"t":116928,"s":0},{"t":116961,"s":8},{"t":117195,"s":10},{"t":117379,"s":8},{"t":118013,"s":10},{"t":118163,"s":8},{"t":119399,"s":10},{"t":119533,"s":8},{"t":120752,"s":10},{"t":120852,"s":8},{"t":120919,"s":0},{"t":120969,"s":16},{"t":121905,"s":18},{"t":122522,"s":16},{"t":123591,"s":0},{"t":123825,"s":2},{"t":123992,"s":0},{"t":124025,"s":8},{"t":124259,"s":0},{"t":124392,"s":16},{"t":124877,"s":18},{"t":125027,"s":16},{"t":127065,"s":18},{"t":127215,"s":16},{"t":127716,"s":18},{"t":128434,"s":16},{"t":128484,"s":0},{"t":128684,"s":2},{"t":128701,"s":10},{"t":132208,"s":8},{"t":133193,"s":10},{"t":133294,"s":8},{"t":134145,"s":10},{"t":134246,"s":8},{"t":134329,"s":0},{"t":134462,"s":16},{"t":134980,"s":18},{"t":135865,"s":16},{"t":136853,"s":18},{"t":137053,"s":16},{"t":137487,"s":20},{"t":137603,"s":16},{"t":138070,"s":18},{"t":138271,"s":16},{"t":138671,"s":0},{"t":138704,"s":8},{"t":139573,"s":10},{"t":139756,"s":8},{"t":140391,"s":10},{"t":140608,"s":8},{"t":141209,"s":10},{"t":141376,"s":8},{"t":141777,"s":10},{"t":141961,"s":8},{"t":142461,"s":10},{"t":142595,"s":8},{"t":143263,"s":0},{"t":143463,"s":16},{"t":143547,"s":0},{"t":144065,"s":8},{"t":144415,"s":0},{"t":144783,"s":16},{"t":145067,"s":18},{"t":145317,"s":16},{"t":146503,"s":18},{"t":146586,"s":2},{"t":146603,"s":0},{"t":147204,"s":8},{"t":147889,"s":0},{"t":148256,"s":16},{"t":148340,"s":0},{"t":148758,"s":16},{"t":148807,"s":0},{"t":148958,"s":8},{"t":149058,"s":0},{"t":149609,"s":16},{"t":149692,"s":0},{"t":150043,"s":16},{"t":150745,"s":18},{"t":150878,"s":16},{"t":151530,"s":20},{"t":151647,"s":16},{"t":152633,"s":18},{"t":152783,"s":16},{"t":153700,"s":0},{"t":153817,"s":2},{"t":153967,"s":0},{"t":154184,"s":2},{"t":154235,"s":10},{"t":154335,"s":8},{"t":154368,"s":0},{"t":154469,"s":16},{"t":154702,"s":18},{"t":154953,"s":16},{"t":155237,"s":0},{"t":155654,"s":8},{"t":155838,"s":0},{"t":156606,"s":16},{"t":156790,"s":18},{"t":156907,"s":16},{"t":156957,"s":0},{"t":157574,"s":8},{"t":157675,"s":0},{"t":158126,"s":8},{"t":158276,"s":10},{"t":158359,"s":2},{"t":158426,"s":0},{"t":158443,"s":16},{"t":160297,"s":18},{"t":160481,"s":16},{"t":162267,"s":18},{"t":162351,"s":16},{"t":162418,"s":0},{"t":162618,"s":8},{"t":163035,"s":10},{"t":163553,"s":8},{"t":164438,"s":10},{"t":164589,"s":8},{"t":165744,"s":10},{"t":165910,"s":8},{"t":166678,"s":10},{"t":166811,"s":8},{"t":167345,"s":0},{"t":167712,"s":16},{"t":167862,"s":0},{"t":168680,"s":16},{"t":168981,"s":0},{"t":169198,"s":8},{"t":169465,"s":0},{"t":169749,"s":16},{"t":170016,"s":0},{"t":170233,"s":8},{"t":170416,"s":0},{"t":170584,"s":16},{"t":173033,"s":18},{"t":173250,"s":16},{"t":173985,"s":0},{"t":175186,"s":16},{"t":175319,"s":18},{"t":175486,"s":16},{"t":175935,"s":0},{"t":176336,"s":16},{"t":176753,"s":0},{"t":177187,"s":16},{"t":178338,"s":18},{"t":178488,"s":16},{"t":179873,"s":0}]');
		this._record.reverse();
	};

	ChuClone.components.player.PlayerPlaybackComponent.prototype = {
        /**
         * @type {String}
         */
		displayName						: "PlayerPlaybackComponent",					// Unique string name for this Trait

        /**
         * @type {ChuClone.GameEntity}
         */
        _player					: null,

		/**
		 * Must have a valid method 'getCurrentTime'
		 * @type {Object}
		 */
		_clockDelegate			: null,

		/**
		 * @type {Array}
		 */
		_record	    : null,

		/**
		 * Bitmask of the current keyboard state
		 * @type {Number}
		 */
		_currentState: 0,

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.player.PlayerPlaybackComponent.superclass.attach.call(this, anEntity);
		},

        execute: function() {
            ChuClone.components.player.PlayerPlaybackComponent.superclass.execute.call(this);
			if( !this._clockDelegate ) {
				console.error("Cannot attach PlayerPlaybackComponent without valid clock delegate");
				return;
			}

			/**
			 * @type {ChuClone.components.player.KeyboardInputComponent }
			 */
			this._keyboardComponent = this.attachedEntity.getComponentWithName( ChuClone.components.player.KeyboardInputComponent .prototype.displayName );
			if( !this._keyboardComponent ) {
				console.error("Cannot attach PlayerInputComponent. Cannot find 'PlayerPlaybackComponent' in attachedEntity");
				return;
			}
			this._keyboardComponent.handleKeyDown = this._keyboardComponent.handleKeyUp = function(){};
        },

		/**
		 * Overrides the keyboardComponents state
		 */
		update: function() {
			var time = this._clockDelegate.getCurrentTime();
			var len = this._record.length;
			var needsUpdate = false;
			var i = 0;
			while( i < len) {
				var stateInfo = this._record[i];
				// Match found - set our state and pop the element
				if(stateInfo.t <= time) {
					this._currentState = stateInfo.s;
					this._record.pop();
					needsUpdate = true;
					break;
				}

				// If this one is higher than our timestamp, then any ones after are as well - exit the loop
//				if( stateInfo.t > time ) {
//					break;
//				}
				i++;
			}

			// Found an update state
			if( needsUpdate ) {
				this._keyboardComponent._keyStates.up = (this._currentState & KEY_STATES.UP);
				this._keyboardComponent._keyStates.down = (this._currentState & KEY_STATES.DOWN);
				this._keyboardComponent._keyStates.left = (this._currentState & KEY_STATES.LEFT);
				this._keyboardComponent._keyStates.right = (this._currentState & KEY_STATES.RIGHT);
			}
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
           ChuClone.components.player.PlayerPlaybackComponent.superclass.detach.call(this);
        },

		/**
		 * Sets the object we call getClock on, probably the playlevelstate
		 * @param {ChuClone.states.PlayLevelState} aDelegate
		 */
		setClockDelegate: function( aDelegate ) {
		   if( typeof aDelegate.getCurrentTime === 'function' ) {
			   this._clockDelegate = aDelegate;
		   }
		},

		/**
		 * @return {Array}
		 */
		getRecord: function() { return this._record }
	};

    ChuClone.extend( ChuClone.components.player.PlayerPlaybackComponent, ChuClone.components.BaseComponent );
})();