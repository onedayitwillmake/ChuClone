/**
 File:
    namespace.js
 Created By:
    Mario Gonzalez - mariogonzalez@gmail.com
 Project:
    ChuClone
 Abstract:
    Standard javascript namespace and extend methods

 Basic Usage:

  License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    ChuClone = (typeof ChuClone === 'undefined') ? {} : ChuClone;

    /**
     * Allows a package to create a namespace within RealtimeMultiplayerGame
     * From Javascript Patterns book
     * @param ns_string
     */
    ChuClone.namespace = function(ns_string)
    {
        var parts = ns_string.split('.'),
            parent = ChuClone,
            i = 0;

        // strip redundant leading global
        if (parts[0] === "ChuClone") {
            parts = parts.slice(1);
        }

        var len = parts.length,
            aPackage = null;
        for (i = 0; i < len; i += 1) {
            var singlePart = parts[i];
            // create a property if it doesn't exist
            if (typeof parent[singlePart] === "undefined") {
                parent[singlePart] = {};
            }
            parent = parent[singlePart];

        }
        return parent;
    };

    /**
     * Allows a simple inheritance model
     * based on http://www.kevs3d.co.uk/dev/canvask3d/scripts/mathlib.js
     */
    ChuClone.extend = function(subc, superc, overrides)
    {
       var subcp = subc.prototype;

		var F = function()
		{
		};
		F.prototype = superc.prototype;

		subc.prototype = new F();       // chain prototypes.
		subc.superclass = superc.prototype;
		subc.prototype.constructor = subc;

		if (superc.prototype.constructor === Object.prototype.constructor)
		{
			superc.prototype.constructor = superc;
		}

		// los metodos de superc, que no esten en esta clase, crear un metodo que
		// llama al metodo de superc.
		for (var method in subcp)
		{
			if (subcp.hasOwnProperty(method))
			{
				subc.prototype[method] = subcp[method];
				/*
				 // tenemos en super un metodo con igual nombre.
				 if ( superc.prototype[method]) {
				 subc.prototype[method]= (function(fn, fnsuper) {
				 return function() {
				 var prevMethod= this.__super;

				 this.__super= fnsuper;

				 var retValue= fn.apply(
				 this,
				 Array.prototype.slice.call(arguments) );

				 this.__super= prevMethod;

				 return retValue;
				 };
				 })(subc.prototype[method], superc.prototype[method]);
				 }
				 */
			}
		}
    };

    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = ( function() {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
                    window.setTimeout( callback, 1000 / 60 );
                };
        })();
    }
}());
