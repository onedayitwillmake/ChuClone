/**
 File:
 	FunctionQueue.js
 Created By:
 	Mario Gonzalez
 Project:
 	ChuClone
 Abstract:
 	Singleton class that should be used instead of settimeout(1) to run a function "nextframe"
 	Because setTimeout is not guaranteed to run when you expect it, it does not provide reproducible results on different systems
 	at different framerates

 Basic Usage:

 	var timeoutId = FunctionQueue.setTimeout( callback, numframes );
 	FunctionQueue.clearTimeout( timeoutId );

 License:
	 Creative Commons Attribution-NonCommercial-ShareAlike
	 http://creativecommons.org/licenses/by-nc-sa/3.0/
 */


(function(){
	ChuClone.namespace("ChuClone.utils");

	var elapsedFrames = 0;
	var queue = [];
	var id = 0;

	ChuClone.utils.FunctionQueue = {
		update: function(){
			elapsedFrames++;
			var i = queue.length;
			while(i--) {
				var callback = queue[i];
				if(callback.__when === elapsedFrames) {
					callback();
					queue.pop();
				}
			}
		},

		setTimeout: function(callback, numframes) {
			callback.__when = elapsedFrames + numframes;
			callback.__id = id++;
			queue.push( callback );
		},

		clearTimeout: function( id ) {
			var len = queue.length;
			for(var i = 0; i < len; i++) {
				if(queue[i].__id === id) {
					queue.splice(i, 1);
					return;
				}
			}
		}
	}
})();