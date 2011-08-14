(function(){
	var partial_html = "<div class='push_3 grid_6' style='margin-left: 20px; margin-top:30px;'>  \
		<p class='jura_48' style='color:#01b0ee; text-align:center;'>LEVEL COMPLETE</p>                                  \
		<div class='clear'></div>                                                                      \
		<div class='grid_6'>&nbsp;</div>                                                                \
		<p class='level_recap_rectangle grayBorder jura_36' style='margin-top:50px;'>#{leveltitle}</p>                         \
		<div class='clear'></div>                                                                         \
		<div class='grid_6'>&nbsp;</div>                                                                   \
		<div class='clear'></div>                                                                           \
		<p class='level_recap_rectangle grayBorder jura_24' id='flash_notice' style='background-color:#98fb98; margin-top:-35px;margin-bottom:30px'>#{notice}</p>\
		<div id='levelstats' class='grid_6'>                                                                                              \
			<div class='level_recap_rectangle alpha grid_2 grayBorder jura_12 ' style='margin-left:-10px;'>Total Time</div>                      \
			<div class='level_recap_rectangle omega grid_4 grayBorder jura_12'>#{totaltime}</div>                                                 \
			 <div class='grid_6' style='margin-bottom:-10px;'>&nbsp;</div>                                                   \
                                                                                                                              \
			<div class='level_recap_rectangle alpha grid_2 grayBorder jura_12' style='margin-left:-10px;'>Total Airtime</div>                        \
			<div class='level_recap_rectangle omega grid_4 grayBorder jura_12'>#{Airtime}</div>                                                     \
			<div class='grid_6' style='margin-bottom:-10px;'>&nbsp;</div>                                                        \
                                                                                                                                  \
			<div class='level_recap_rectangle alpha grid_2 grayBorder jura_12' style='margin-left:-10px;'>Max Jump</div>                                 \
			<div class='level_recap_rectangle omega grid_4 grayBorder jura_12'>#{maxjump}</div>                                                           \
			<div class='grid_6' style='margin-bottom:-10px;'>&nbsp;</div>                                                             \
                                                                                                                                       \
			<div class='level_recap_rectangle alpha grid_2 grayBorder jura_12' style='margin-left:-10px;'>Number of Deaths</div>                              \
			<div class='level_recap_rectangle omega grid_4 grayBorder jura_12'>#{numdeaths}</div>                                                              \
			<div class='grid_6' style='margin-bottom:-10px;'>&nbsp;</div>                                                                 \
		</div>                                                                                                                             \
	</div>";

	ChuClone.namespace("ChuClone.gui");

	var htmlElement = null;
	ChuClone.gui.LevelRecap = {
		show: function(time, title) {
			if( htmlElement ) {
				console.error(" Already have an HTMLElement. Aborting...");
				return;
			}

			var partial = partial_html.replace("#{leveltitle}", title)
			.replace("#{totaltime}", Math.round(time/1000*1000)/1000 + " Seconds");

			// Reference to games htmlElement
			var gameContainer = document.getElementById('gameContainer');

			// Where we will place our recap div
			htmlElement = document.createElement("div");
			htmlElement.id = 'level_recap'
			htmlElement.setAttribute('class', 'grid_12');
			htmlElement.setAttribute('style', 'margin-left:20px');
			htmlElement.style.position = "absolute";
			htmlElement.style.zIndex = "2";
			htmlElement.style.top = gameContainer.offsetTop + "px";
			htmlElement.style.left = gameContainer.offsetLeft + "px";
			htmlElement.style.opacity = 0;
			htmlElement.style.cursor = "pointer";
			htmlElement.innerHTML = partial;

			//console.log(htmlElement.children)

			// FADE IN
			new TWEEN.Tween({opacity:0})
				.to({opacity: 1}, 800)
				.easing( TWEEN.Easing.Sinusoidal.EaseIn )
				.onUpdate( function(){ htmlElement.style.opacity = this.opacity; })
				.start();

			var itr = 1;
			for(var i = 0; i < htmlElement.children[0].children.length-1; i++){
				var child = htmlElement.children[0].children[i];
				child.style.top = '0px';
				child.style.position = 'relative';

				// START FROM BELOW
				new TWEEN.Tween({target: child, pos: 150, original: parseInt(child.style.top)})
					.to({pos: 0}, itr*20 + 500)
					.easing( TWEEN.Easing.Sinusoidal.EaseInOut )
					.onUpdate( function(){
							this.target.style.top = Math.round(this.original + this.pos) + "px";
							//this.target.style.backgroundColor = "#" + (Math.floor(Math.random()*0xFFFFFF)).toString(16)
							console.log()
						})
					.start();


				//console.log("ABC");
				itr++;
			}

			gameContainer.parentNode.insertBefore(htmlElement, gameContainer);


			//itr = 1;
			var levelStats = document.getElementById('levelstats')
			for( i = 0; i < levelStats.children.length; i++){
				var child = levelStats.children[i];
				child.style.top = '0px';
				child.style.position = 'relative';
				// START FROM BELOW
				new TWEEN.Tween({target: child, pos: 150, original: parseInt(child.style.top)})
					.to({pos: 0}, itr*20 + 500)
					.easing( TWEEN.Easing.Sinusoidal.EaseInOut )
					.onUpdate( function(){
							this.target.style.top = Math.round(this.original + this.pos) + "px";
							//this.target.style.backgroundColor = "#" + (Math.floor(Math.random()*0xFFFFFF)).toString(16)
							console.log()
						})
					.start();


				//console.log("ABC");
				itr++;
			}

			//var instructions = document.getElementById('instructions');
			//var isShowing = instructions != null;
			//var gameContainer = document.getElementById('gameContainer');
			//if( !isShowing ) {
			//	instructions = document.createElement("div");
			//	instructions.id = 'instructions'
			//	instructions.setAttribute('class', 'grid_12');
			//	instructions.innerHTML = '<img src="game/assets/images/page/instructions.png" alt="">';

			//
			//	new TWEEN.Tween({opacity:0})
			//	.to({opacity: 1}, 500)
			//	.easing( TWEEN.Easing.Sinusoidal.EaseIn )
			//	.onUpdate( function(){ instructions.style.opacity = this.opacity; })
			//	.start();
			//
			//	instructions.addEventListener('click', function(e){ ChuClone.gui.HUDController.toggleInstructions() }, false);
			//	gameContainer.parentNode.insertBefore(instructions, gameContainer)
			//} else {
			//
			//	new TWEEN.Tween({opacity:1})
			//	.to({opacity: 0}, 150)
			//	.easing( TWEEN.Easing.Sinusoidal.EaseIn )
			//	.onUpdate( function(){ instructions.style.opacity = this.opacity; })
			//	.onComplete( function() { gameContainer.parentNode.removeChild( instructions ) })
			//	.start();
			//}
		},

		destroy: function() {

		}
	}
	console.log(ChuClone.gui.LevelRecap)
})();