(function(){
	var partial_html = "<div class='push_3 grid_6' style='margin-left: 20px; margin-top:30px;'>  										\
		<p class='jura_48' style='color:#01b0ee; text-align:center;'>LEVEL COMPLETE</p>                                  				\
		<div class='clear'></div>                                                                      									\
		<div class='grid_6'>&nbsp;</div>                                                                								\
		<p class='level_recap_rectangle grayBorder jura_36' style='margin-top:50px;'>#{leveltitle}</p>                         			\
		<div class='clear'></div>                                                                         								\
		<div class='grid_6'>&nbsp;</div>																								\
		<div class='clear'></div>                                                        							                   	\
		<p class='level_recap_rectangle grayBorder jura_24' id='flash_notice' style='background-color:#98fb98; margin-top:-35px;margin-bottom:30px'>#{notice}</p>\
		<div id='levelstats' class='grid_6'>                                                                                            \
			<div class='level_recap_rectangle alpha grid_2 grayBorder jura_12 ' style='margin-left:-10px;'>Total Time</div>             \
			<div class='level_recap_rectangle omega grid_4 grayBorder jura_12'>#{totaltime}</div>                                       \
			 <div class='grid_6' style='margin-bottom:-10px;'>&nbsp;</div>                                                   			\
		<div class='clear'></div>                                                                           							\
                                                                                                                              			\
			<div class='level_recap_rectangle alpha grid_2 grayBorder jura_12' style='margin-left:-10px;'>Total Airtime</div>           \
			<div class='level_recap_rectangle omega grid_4 grayBorder jura_12'>#{totalAirtime}</div>                                    \
			<div class='grid_6' style='margin-bottom:-10px;'>&nbsp;</div>                                                               \
                                                                                                                                        \
			<div class='level_recap_rectangle alpha grid_2 grayBorder jura_12' style='margin-left:-10px;'>Max Airtime</div>             \
			<div class='level_recap_rectangle omega grid_4 grayBorder jura_12'>#{maxAirtime}</div>                                      \
			<div class='grid_6' style='margin-bottom:-10px;'>&nbsp;</div>                                                               \
                                                                                                                                        \
			<div class='level_recap_rectangle alpha grid_2 grayBorder jura_12' style='margin-left:-10px;'>Number of Jumps</div>         \
			<div class='level_recap_rectangle omega grid_4 grayBorder jura_12'>#{totalJumps}</div>                                      \
			<div class='grid_6' style='margin-bottom:-10px;'>&nbsp;</div>                                                               \
																																		\
			<div class='level_recap_rectangle alpha grid_2 grayBorder jura_12' style='margin-left:-10px;'>Number of Deaths</div>        \
			<div class='level_recap_rectangle omega grid_4 grayBorder jura_12'>#{totalDeaths}</div>                                     \
			<div class='grid_6' style='margin-bottom:-10px;'>&nbsp;</div>                                                               \
		</div>\
	</div>";

	ChuClone.namespace("ChuClone.gui");

	var htmlElement = null;
	ChuClone.gui.LevelRecap = {
		show: function(time, title) {
			if( htmlElement ) {
				console.error(" Already have an HTMLElement. Aborting...");
				return;
			}

			var achievementTracker = ChuClone.model.AchievementTracker.getInstance();

			var partial = partial_html.replace("#{leveltitle}", title)
			.replace("#{totaltime}", this.convertToTime(time))
			.replace("#{totalAirtime}", this.convertToTime(achievementTracker._counterTotalAirtime))
			.replace("#{maxAirtime}", this.convertToTime(achievementTracker._counterMaxAirtime))
			.replace("#{totalJumps}", achievementTracker._counterTotalJumps)
			.replace("#{totalDeaths}", achievementTracker._counterTotalDeaths)

			// Reference to games htmlElement
			var gameContainer = document.getElementById('gameContainer');

			// Where we will place our recap div
			htmlElement = document.createElement("div");
			htmlElement.innerHTML = partial;
			htmlElement.id = 'level_recap'
			htmlElement.setAttribute('class', 'container_12');
			htmlElement.setAttribute('style', 'margin-left:20px');
			htmlElement.style.position = "absolute";
			htmlElement.style.zIndex = "2";

			if( ChuClone.GameViewController.INSTANCE.getFullscreen() ) {
				htmlElement.style.top = gameContainer.offsetTop + 150 + "px";
				htmlElement.style.left = gameContainer.offsetLeft + (gameContainer.clientWidth/2) - 290  + "px";
			} else {
				htmlElement.style.top = gameContainer.offsetTop + "px";
				htmlElement.style.left = gameContainer.offsetLeft + "px";
			}


			htmlElement.style.opacity = 0;
			htmlElement.style.cursor = "pointer";

			debugger;
			// Center if not inside of a div
			if(gameContainer.parentNode.tagName === "BODY") {
				// Container width - 960/2 (960 comes from the fact that we're using grid960 css)
				htmlElement.style.left = (gameContainer.parentNode.offsetWidth/2-480) + "px";
				htmlElement.style.marginLeft = "0px";

				// No need to display stats
				htmlElement.firstChild.removeChild( htmlElement.firstChild.children[7] );
			}


			//console.log(htmlElement.children)

			// FADE IN
			new TWEEN.Tween({opacity:0})
				.to({opacity: 1}, 800)
				.easing( TWEEN.Easing.Sinusoidal.EaseIn )
				.onUpdate( function(){ htmlElement.style.opacity = this.opacity; })
				.start();


			// Animate the children from below
			ChuClone.utils.animateChildrenInFromBelow( htmlElement.firstChild );
			ChuClone.utils.animateChildrenInFromBelow( htmlElement.firstChild.lastChild.previousSibling ); // Strange way of getting the level_stats div, cus last real one is a textnode
			gameContainer.parentNode.insertBefore(htmlElement, gameContainer);

		},

		/**
		 * Removes the HTMLElement from the DOM
		 */
		destroy: function() {
			if(!htmlElement) return;
			htmlElement.parentNode.removeChild(htmlElement);
			htmlElement = null;
		},

		///// ACCESSORS
		convertToTime: function( milliseconds ) {
			return Math.round(milliseconds/1000*1000)/1000 + " Seconds"
		}
	};
})();