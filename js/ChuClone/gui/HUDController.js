/**
 File:
 	HUDController.js
 Created By:
 	Mario Gonzalez
 Project:
 	ChuClone
 Abstract:
 	Controls Heads Up Display for the game. I.e.
 	Time etc

 Basic Usage:
 License:
	 Creative Commons Attribution-NonCommercial-ShareAlike
	 http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function() {
	ChuClone.namespace("ChuClone.gui");

	var domElementTime = null;
	var timeCanvas = null;
	var timeContext = null;
	ChuClone.gui.HUDController = {
		onDomReady: function(e) {
			window.removeEventListener('DOMContentLoaded', ChuClone.gui.HUDController.onDomReady, false);
			ChuClone.gui.HUDController.createTimeCanvas();

			ChuClone.gui.HUDController.setupEvents();
			// TODO: TEMP HACK TO ALLOW THE FONT TO LOAD
			setTimeout(ChuClone.gui.HUDController.setTimeInSeconds, 2000);
		},

		/**
		 * Sets up game related event listeners
		 */
		setupEvents: function() {

			ChuClone.Events.Dispatcher.addListener(ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_CREATED, function( aLevelManager ) {
				if(document.getElementById('leveltitle'))
				document.getElementById('leveltitle').innerHTML = aLevelManager._levelModel.levelName;
			});

			if( document.getElementById('fullscreen_toggle') ) {
				document.getElementById('fullscreen_toggle').style.cursor = "pointer"
				document.getElementById('fullscreen_toggle').addEventListener('click', function(e){ ChuClone.gui.HUDController.toggleFullscreen() }, false);
			}

			if( document.getElementById('instructions_toggle') ) {
				document.getElementById('instructions_toggle').style.cursor = "pointer"
				document.getElementById('instructions_toggle').addEventListener('click', function(e){ ChuClone.gui.HUDController.toggleInstructions() }, false);
			}
		},

		/**
		 * Creates a canvas element to display the elapsed level playtime
		 */
		createTimeCanvas: function() {
			var container = document.getElementById("HUDTime");
			if (!container) {
				console.log("Could not create HUDTime... aborting");
				return;
			}

			container.style.height = 43 + "px";
			// TODO: For some reason object is reporting clientWidth as 1500px
			container.style.width = 300 + "px";
			container.textContent = "";

			timeCanvas = document.createElement('canvas');
			timeCanvas.width = container.offsetWidth;
			timeCanvas.height = container.offsetHeight;
			container.appendChild(timeCanvas);

			var context = timeCanvas.getContext("2d");
			context.font = "48px Jura";
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillStyle = "rgba(32, 45, 21, " + 1 + ")";

			timeContext = context;
			timeContext.width = container.offsetWidth;
			timeContext.height = container.offsetHeight;
		},

		/**
		 * Display a time in the HUDTime element
		 * @param aTime
		 */
		setTimeInSeconds: function(aTime) {
			if (!timeContext) return;

			aTime |= 0;
			var seconds = Math.round(aTime / 1000 * 10) / 10;
			seconds += (seconds % 1) ? " secs" : ".0 secs"; // eg Adds .0 to 12 -

			timeContext.clearRect(0, 0, timeContext.width, timeContext.height);
			timeContext.fillText(seconds, 150, Math.round(timeContext.height * 0.5));
		},

		/**
		 * Switches on/off fullscreen mode
		 */
		toggleFullscreen: function() {
			var fullscreenToggle = document.getElementById('fullscreen_toggle');
			var gameContainer = document.getElementById('gameContainer');
			var HUDTime = document.getElementById('HUDTime');

			if( !ChuClone.GameViewController.INSTANCE.getFullscreen() ) {

				// Tell the gameviewcontroller
				ChuClone.GameViewController.INSTANCE.setFullscreen( true );

				// Save and set the style for the fullscreen toggle
				ChuClone.utils.StyleMemoizer.rememberStyle(fullscreenToggle.id);

				fullscreenToggle.style.position = "absolute";
				fullscreenToggle.style.top = "47px";
				fullscreenToggle.style.left = "165px";
				fullscreenToggle.style.zIndex = "2";
				fullscreenToggle.innerHTML = '<p class="grayBorder"> Exit Fullscreen</p>';

				// Set custom styles for the HUDTime
				ChuClone.utils.StyleMemoizer.rememberStyle(HUDTime.id);
				HUDTime.style.position = "absolute";
				HUDTime.style.zIndex = "2";

				// Hide all children except the gamecontainers parent
				ChuClone.utils.hideAllChildren( document.getElementsByTagName('body')[0], [gameContainer.parentNode]);

				// Hide all children in the parent except gamecontainer
				ChuClone.utils.hideAllChildren( gameContainer.parentNode, [gameContainer]);
				fullscreenToggle.style.display = "block";
				HUDTime.style.display = "";

			} else {

				// Tell the gameviewcontainer
				ChuClone.GameViewController.INSTANCE.setFullscreen( false );

				// Unhide all children
				ChuClone.utils.unhideAllChildren( document.getElementsByTagName('body')[0], null );
				ChuClone.utils.unhideAllChildren( gameContainer.parentNode, null);

				// Restore 'fullscreen_toggle'
				ChuClone.utils.StyleMemoizer.restoreStyle(fullscreenToggle.id);
				fullscreenToggle.innerHTML = '<p class="grayBorder"> Full Screen</p>'

				// Restore 'HUDTime'
				ChuClone.utils.StyleMemoizer.restoreStyle('HUDTime');

			}
		},

		/**
		 * Toggle the instructions screen
		 */
		toggleInstructions: function() {
			var instructions = document.getElementById('instructions');
			var isShowing = instructions != null;
			var gameContainer = document.getElementById('gameContainer');
			if( !isShowing ) {
				instructions = document.createElement("div");
				instructions.id = 'instructions'
				instructions.setAttribute('class', 'grid_12');
				instructions.innerHTML = '<img src="game/assets/images/page/instructions.png" alt="">';
				instructions.style.position = "absolute"
				instructions.style.zIndex = "2"
				instructions.style.top = gameContainer.offsetTop+1 + "px";
				instructions.style.left = gameContainer.offsetLeft-9 + "px";
				instructions.style.opacity = 0;
				instructions.style.cursor = "pointer"

				new TWEEN.Tween({opacity:0})
				.to({opacity: 1}, 500)
				.easing( TWEEN.Easing.Sinusoidal.EaseIn )
				.onUpdate( function(){ instructions.style.opacity = this.opacity; })
				.start();

				instructions.addEventListener('click', function(e){ ChuClone.gui.HUDController.toggleInstructions() }, false);
				gameContainer.parentNode.insertBefore(instructions, gameContainer)
			} else {

				new TWEEN.Tween({opacity:1})
				.to({opacity: 0}, 150)
				.easing( TWEEN.Easing.Sinusoidal.EaseIn )
				.onUpdate( function(){ instructions.style.opacity = this.opacity; })
				.onComplete( function() { gameContainer.parentNode.removeChild( instructions ) })
				.start();
			}
		}
	};

	window.addEventListener('DOMContentLoaded', ChuClone.gui.HUDController.onDomReady, false);
})();