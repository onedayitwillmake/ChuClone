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
    var hdButtonElement = null;
    var isHD    = false;
	var timeCanvas = null;
	var timeContext = null;
	var lastScoreUpdate = Date.now();

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

			var that = this;
			ChuClone.Events.Dispatcher.addListener(ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_CREATED, function( aLevelManager ) {
				if(document.getElementById('leveltitle'))
					document.getElementById('leveltitle').innerHTML = aLevelManager._levelModel.levelName;

				if( document.getElementById('score_container') )
					that.updateScores();

                if( document.getElementById('author') ) {
                    document.getElementById('author').innerHTML = aLevelManager._levelModel.author || "1dayitwillmake";
                }

				if( aLevelManager.getModel().levelName != "TitleScree" )
					document.title = "ChuClone - " + aLevelManager._levelModel.levelName;
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
			context.fillStyle = "rgba(45, 45, 45, " + 1 + ")";

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
			timeContext.fillText(seconds, 150, Math.round(timeContext.height * 0.4));
		},

		/**
		 * Switches on/off fullscreen mode
		 */
		toggleFullscreen: function() {

			var fullscreenToggle = document.getElementById('fullscreen_toggle');
			var gameContainer = document.getElementById('gameContainer');
			var HUDTime = document.getElementById('HUDTime');

			ChuClone.model.AnalyticsTracker.trackFullscreen( !ChuClone.GameViewController.INSTANCE.getFullscreen() );

			if( !ChuClone.GameViewController.INSTANCE.getFullscreen() ) {

				// Tell the gameviewcontroller
				ChuClone.GameViewController.INSTANCE.setFullscreen( true );

				// Save and set the style for the fullscreen toggle
				ChuClone.utils.StyleMemoizer.rememberStyle(fullscreenToggle.id);

				fullscreenToggle.style.position = "absolute";
				fullscreenToggle.style.top = "1%";
				fullscreenToggle.style.left = "1%";
				fullscreenToggle.style.zIndex = "2";
				fullscreenToggle.innerHTML = '<p class="grayBorder"> Exit Fullscreen</p>';



				console.log(window.innerHeight, window.innerHeight * 0.1)
				// Set custom styles for the HUDTime
				ChuClone.utils.StyleMemoizer.rememberStyle(HUDTime.id);
				HUDTime.style.position = "absolute";
				HUDTime.style.top = "1%";
				HUDTime.style.right = "1%";
				HUDTime.style.marginTop = "10px";
				HUDTime.style.marginRight = "10px";
				HUDTime.style.zIndex = "2";

				// Hide all children except the gamecontainers parent
				ChuClone.utils.hideAllChildren( document.getElementsByTagName('body')[0], [gameContainer.parentNode]);

				// Hide all children in the parent except gamecontainer
				ChuClone.utils.hideAllChildren( gameContainer.parentNode, [gameContainer]);
				fullscreenToggle.style.display = "block";
				HUDTime.style.display = "";

                hdButtonElement = fullscreenToggle.cloneNode(true);
                hdButtonElement.innerHTML = '<p class="grayBorder"> Toggle HD </p>';
                hdButtonElement.id = "hdbutton";
                hdButtonElement.style.width = "100px";
                hdButtonElement.style.left = window.innerWidth*0.1 + 10 + "px";
                hdButtonElement.addEventListener( 'mousedown', function(){
                    isHD = !isHD;
					ChuClone.model.AnalyticsTracker.trackHD( isHD );
                    ChuClone.GameViewController.INSTANCE.setFullscreen( true, isHD );
                });
                document.body.appendChild( hdButtonElement )
			} else {

				// Tell the gameviewcontainer
				ChuClone.GameViewController.INSTANCE.setFullscreen( false, true );

				// Unhide all children
				ChuClone.utils.unhideAllChildren( document.getElementsByTagName('body')[0], null );
				ChuClone.utils.unhideAllChildren( gameContainer.parentNode, null);

				// Restore 'fullscreen_toggle'
				ChuClone.utils.StyleMemoizer.restoreStyle(fullscreenToggle.id);
				fullscreenToggle.innerHTML = '<p class="grayBorder"> Full Screen</p>'

				// Restore 'HUDTime'
				ChuClone.utils.StyleMemoizer.restoreStyle('HUDTime');

                document.body.removeChild( hdButtonElement );
			}
		},

		/**
		 * Toggle the instructions screen
		 */
		toggleInstructions: function() {


			var instructions = document.getElementById('instructions');
			var isShowing = instructions != null;
			var gameContainer = document.getElementById('gameContainer');

			ChuClone.model.AnalyticsTracker.getInstance().trackInstructions( !isShowing );

			if( !isShowing ) {
				instructions = document.createElement("div");
				instructions.id = 'instructions'
				instructions.setAttribute('class', 'grid_12');
				instructions.innerHTML = '<img src="/game/assets/images/page/instructions.png" alt="">';
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
		},

		/**
		 * Toggle the instructions screen
		 */
		showTutorialNote: function() {
			var instructions = document.getElementById('instructions');
			var isShowing = instructions != null;
			var gameContainer = document.getElementById('gameContainer');
			if( !isShowing ) {
				instructions = document.createElement("div");
				instructions.id = 'instructions'
				instructions.setAttribute('class', 'grid_12');
				instructions.innerHTML = '<img src="/game/assets/images/page/instructions.png" alt="">';
				instructions.style.position = "absolute"
				instructions.style.zIndex = "2"
				instructions.style.top = gameContainer.offsetTop+1 + "px";
				instructions.style.left = gameContainer.offsetLeft-9 + "px";
				instructions.style.opacity = 0;
				instructions.style.cursor = "pointer";

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
		},

		/**
		 * Populates the score container gui with new scores
		 * @param {Boolean} force If true, will always update (ignoring id/time check)
		 */
		updateScores: function( force ) {
			var level_id = ChuClone.utils.getLevelIDFromURL();
			if( !level_id ) return; // No level-id in address bar, probably at titlescreen


			var scoresContainer = document.getElementById('score_container');

			// level_id is different, or at least a minute has passed since getting the score
			if(!force && scoresContainer.getAttribute("data-id") == level_id && Date.now()-lastScoreUpdate < 60 * 1000) {
				console.log("Same id ");
				return;
			}
			// remove whats there
			lastScoreUpdate = Date.now();
			scoresContainer.innerHTML = "";
			scoresContainer.setAttribute("data-id", level_id);

			// Fetch the results
			var request = new XMLHttpRequest();
			var that = this;
			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					scoresContainer.innerHTML = request.responseText;
					ChuClone.utils.animateChildrenInFromBelow( scoresContainer, 400);
				}
			};
			request.open("GET", ChuClone.model.Constants.SERVER.SCORE_LOAD_LOCATION.replace("#", level_id ));
			request.send(null);
		}
	};

	window.addEventListener('DOMContentLoaded', ChuClone.gui.HUDController.onDomReady, false);
})();