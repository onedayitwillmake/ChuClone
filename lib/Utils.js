(function(){
	Sketch.Utils = {};
	Sketch.Utils.randRange = function( a, b ) {
		return Math.random()*(b-a) + a;
	};


	Sketch.GUIHelper = function( ribbonPaintInstance ) {

		this._propProxy = {};

		this._gui = new DAT.GUI();
		this._gui.autoListen = false;
		this._ribbonPaintInstance = ribbonPaintInstance;

		this.initProps();
		this.initListeners();

		// Work around for display bug in DAT.GUI
		this._gui.close();
//		this._gui.open();
	};
	Sketch.GUIHelper.prototype = {
		_gui					: null,
		_propProxy				: null,
		_ribbonPaintInstance	: null,
		_resetTimeout			: 0,

		initProps: function() {
			var that = this;
			this.add("_bristleCount").min(1).max(15).step(1);
			this.add('_brushRadius').min(0).max(20);
			this.add('_filamentCount').min(1).max(50).step(1);
			this.add('_filamentSpacing').min(1).max(50);
			this.add('_frictionMin').min(0.85).max(0.93);
			this.add('_frictionMax').min(0.85).max(0.93);
			this.add("ALPHA").min(0.01).max(0.5);
			this.add('FADE');
			this.add('CURVES');
			this.add('ONBLACK');
			
		},

		// Catch add calls so that it will modify our property proxy instead of the actual ribbonpaint instance
		add: function( propName ) {
			this._propProxy[propName] = this._ribbonPaintInstance[propName];
			return this._gui.add(this._propProxy, propName);
		},
		initListeners: function() {
			var that = this;
			for( var i = 0; i < DAT.GUI.allControllers.length; ++i ) {
				var controller = DAT.GUI.allControllers[i];
				controller.onChange( function( value ) {
						that.onChange(controller, value)
				});
			}
		},

		onChange: function( aController, newValue ) {

			clearTimeout( this._resetTimeout );
			var that = this;

			// Wait a bit incase the user also changes other properties -
			// If not - set all the ribbonpaint properties and recreate the brush
			this._resetTimeout = setTimeout(function(){
				that._ribbonPaintInstance.dealloc();

				for(var prop in that._propProxy) {

					// Prototype property
					if(prop.indexOf("_") < 0) {
					   Sketch.RibbonPaint.prototype[prop] = that._propProxy[prop]
					} else { // instance property
					 	that._ribbonPaintInstance[prop] = that._propProxy[prop];
					}
				}

				that._ribbonPaintInstance.createBrush();
				that.adjustInstructionsColor();
			}, 1000);
		},

		adjustInstructionsColor: function() {
			document.getElementById("instructions").style.setProperty("color", Sketch.RibbonPaint.ONBLACK ? "#EEEEEE" : "#DDDDDD")
		}
	}

})();