/**
 File:
    ChuCloneGame.js
 Created By:
    Mario Gonzalez - mariogonzalez@gmail.com
 Project:
    ChuClone
 Abstract:
    This class controls the level editor in ChuClone
 Basic Usage:
    // Pass worldcontroller and gameviewcontroller
    var editor = new ChuClone.editor.WorldEditor( aWorldController, aGameViewController );
 Version:
    1.0

 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function() {
    var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;
    var WAIT_TIMEOUT = 0;

	var instance = null;
    ChuClone.namespace("ChuClone.editor");

    /**
     * Creates a new WorldEditor
     * @param {ChuClone.physics.WorldController} aWorldController
     */
    ChuClone.editor.WorldEditor = function( aWorldController, aGameView ) {
        this._worldController = aWorldController;
        this._gameView = aGameView;

		if(instance == null) {
			instance = this;
		} else {
			console.error("ChuClone.editor.WorldEditor - Instance already exist!");
		}

        this._mousePosition = new Box2D.Common.Math.b2Vec2(0,0);

        this.setupGui();
		this.setupEvents();

		//document.body.style.overflowY = "hidden"

        // Little hack to prevent accidently leaving the page
        window.onbeforeunload = function(e) {
            return "Exiting page will lose unsaved changes!";
        };
    };



    ChuClone.editor.WorldEditor.prototype = {
        /**
         * @type {ChuClone.physics.WorldController}
         */
        _worldController: null,
        /**
         * @type {ChuClone.GameViewController}
         */
        _gameView       : null,
        /**
         * @type {Box2D.Common.Math.b2Vec2}
         */
        _mousePosition  : null,

		/**
		 * @type {ChuClone.editor.ShiftDragHelper}
		 */
		_shiftDragHelper : null,

		/**
         * @type {Box2D.Common.Math.b2Vec2}
         */
		_dragOffset		: null,

        /**
         * The currently edited b2Body
         * @type {Box2D.Dynamics.b2Body}
         */
        _currentBody    : null,
        /**
         * @type {DAT.GUI}
         */
        _guiModification   : null,
        /**
         * @type {DAT.GUI}
         */
        _guiCreation    : null,
        /**
         * @type {ChuClone.editor.CameraGUI}
         */
        _guiCamera      : null,

        /**
         * @type {ChuClone.editor.PlayerGUI}
         */
        _guiPlayer      : null,

		/**
		 * @type {ChuClone.editor.ComponentGUIController}
		 */
		_guiComponent	: null,

        /**
         * We modify this not the b2Body directly
		 * @type {Object}
         */
        _propProxy         		: {x: 5, y: 5, width: 3, height:3, depth: 3},

		/**
		 * A reference to the currently being edited component from the dropdown list
		 */
		_currentEditedComponent	: 0,

		/**
         * Components we want to be able to toggle with the editor
		 * @see {ChuClone.editor.WorldEditor.prototype.addComponentsToGui}
		 * @type {Object}
         */
		_toggableComponents	: {},

		/**
		 * All {DAT.GUI.Controllers}
		 * @type {Object}
		 */
        _controllers        : {},

        _closures           : {'mousemove':null, 'mouseup':null, 'mousedown': null},

        /**
         * Setups up mouse related event callbacks
         */
        setupMouseEvents: function() {
            var that = this;
            this._closures['mousedown'] = function(e) { that.onMouseDown(e); };
            this._closures['mousemove'] = function(e) { that.onDraggingPiece(e); };
            this._closures['mouseup'] = function(e) { that.onMouseUp(e); };

            this._worldController.getDebugDraw().GetSprite().canvas.addEventListener( 'mousedown', this._closures['mousedown'], false );
            window.addEventListener( 'mouseup', this._closures['mouseup'], false );

			this._closures['mousewheel'] = function(e) {
				var delta = e.wheelDelta || -e.detail;
				var speed = (delta < 0) ? -1 : 1;
				speed *= 0.1;

				var scale = that._worldController.getDebugDraw().GetDrawScale();
				scale += speed;

				// Apply scale - only if not negative
				if (scale > 0) that._worldController.getDebugDraw().SetDrawScale(scale);

				e.preventDefault();
			};


			this._worldController.getDebugDraw().GetSprite().canvas.addEventListener( 'mousewheel',this._closures['mousewheel'], false );
			this._worldController.getDebugDraw().GetSprite().canvas.addEventListener( 'DOMMouseScroll',this._closures['mousewheel'], false );
		},


        /**
         * Sets up keyboard related event callbacks
         */
        setupKeyboardEvents: function() {
            var that = this;

            this._closures['keydown'] = function(e) { that.onKeyDown(e); };
            this._closures['keyup'] = function(e) { that.onKeyUp(e); };
			this._closures['keypress'] = function(e) { that.handleKeyboardShortcuts(e); };

            document.addEventListener('keydown', this._closures['keydown'], false);
            document.addEventListener('keypress', this._closures['keypress'], false);
            document.addEventListener('keyup', this._closures['keyup'], false);
        },

		/**
		 * Listen for ChuClone related events
		 */
		setupEvents: function(){
			this.setupMouseEvents();
			this.setupKeyboardEvents();
		},


        /**
         * Setup DAT.GUI controllers
         */
        setupGui: function() {

            var that = this;
//            DAT.GUI.autoPlace = false;

            this._guiModification = new DAT.GUI({width: ChuClone.model.Constants.EDITOR.PANEL_WIDTH+20});
            this._guiModification.name("Modification");
            this._guiModification.autoListen = false;


			// Add a bunch of controls for common entity props
            this.addControllerWithTimeout(this._guiModification, "x", this._propProxy.x).step(0.1);
            this.addControllerWithTimeout(this._guiModification, "y", this._propProxy.y).step(0.1);
            this.addControllerWithTimeout(this._guiModification, "width", this._propProxy.width).min(0.01).max(Math.round(3000/PTM_RATIO)).step(0.01);
            this.addControllerWithTimeout(this._guiModification, "height", this._propProxy.height).min(0.01).max(Math.round(3000/PTM_RATIO)).step(0.01);
            this.addControllerWithTimeout(this._guiModification, "depth", this._propProxy.depth).min(0.01).max(3000/PTM_RATIO).step(0.025);

			// Add a dropdown box to modify which component is being edited
			this._controllers['currentComponent'] = this._guiModification.add(this, '_currentEditedComponent').name("Components")
            this._controllers['currentComponent'].options.apply( this._controllers['currentComponent'], [	]);
            this._controllers['currentComponent'].onChange( function( selectedIndex ) {

				// No components
				if( that._controllers['currentComponent'].domElement.lastChild.children.length === 0 ) {
					that._guiComponent.hideAll();
				   	return;
				}

				// Get the value based on the current index
				var optionsValue = that._controllers['currentComponent'].domElement.lastChild.children[selectedIndex].innerText;
				that._guiComponent.setupGUIForComponent( that._currentBody.GetUserData().getComponentWithName( optionsValue ) );
			});

			// Add a toggle for all addable components
			this.addComponentsToGui();


			// Open close (bug in DAT.GUI first rendering)
            this._guiModification.close();
            this._guiModification.open();

            // Create the GUI the handles the creation/deletion of entities
            this._guiCreation = new DAT.GUI({width: ChuClone.model.Constants.EDITOR.PANEL_WIDTH});
            this._guiCreation.name("Creation");
            this._guiCreation.autoListen = false;

			// Add some butons to that gui
            this._controllers['onShouldCreate'] = this._guiCreation.add(this, 'onShouldCreate').name("Create Entity");
            this._controllers['onShouldClone'] = this._guiCreation.add(this, 'onShouldCloneEntity').name("Clone Entity")
            this._controllers['onShouldDelete'] = this._guiCreation.add(this, 'onShouldDelete').name("Destroy Entity");
			this._controllers['resetLevel'] = this._guiCreation.add(this, 'onShouldClearLevel').name("Clear Level");


			// Open close (bug in DAT.GUI first rendering)
            this._guiCreation.close();
            this._guiCreation.open();

			// Create the camera gui
            this._guiCamera = new ChuClone.editor.CameraGUI( this._gameView.getCamera() );
            this._guiCamera.setDebugDraw( this._worldController.getDebugDraw() );

			// Create the player gui
            this._guiPlayer = new ChuClone.editor.PlayerGUI();

			// Setup component gui
			this._guiComponent = new ChuClone.editor.ComponentGUIController();
        },
		/**
		 * Adds certain components to the GUI controls
		 */
		addComponentsToGui: function() {
			var that = this;
			// Store interesting components in to a container
			this._toggableComponents[ChuClone.components.JumpPadComponent.prototype.displayName] = ChuClone.components.JumpPadComponent;
			this._toggableComponents[ChuClone.components.FrictionPadComponent.prototype.displayName] = ChuClone.components.FrictionPadComponent;
			this._toggableComponents[ChuClone.components.RespawnComponent.prototype.displayName] = ChuClone.components.RespawnComponent;
			this._toggableComponents[ChuClone.components.GoalPadComponent.prototype.displayName] = ChuClone.components.GoalPadComponent;
			this._toggableComponents[ChuClone.components.MovingPlatformComponent.prototype.displayName] = ChuClone.components.MovingPlatformComponent;
			this._toggableComponents[ChuClone.components.DeathPadComponent.prototype.displayName] = ChuClone.components.DeathPadComponent;
			this._toggableComponents[ChuClone.components.PortalComponent.prototype.displayName] = ChuClone.components.PortalComponent;

            //this._toggableComponents[ChuClone.components.AutoRotationComponent.prototype.displayName] = ChuClone.components.AutoRotationComponent;
			//this._toggableComponents[ChuClone.components.misc.TutorialNoteComponent.prototype.displayName] = ChuClone.components.misc.TutorialNoteComponent;

			// Add a gui control for each component
			for(var aComponentType in this._toggableComponents) {
				if(!this._toggableComponents.hasOwnProperty( aComponentType )) continue;

				this._propProxy[aComponentType] = false;
				this._controllers[aComponentType] = this._guiModification.add( this._propProxy, aComponentType );
				this._controllers[aComponentType].onChange( function(aValue){ that.toggleComponent(this, aValue); } );
			}
		},

		/**
		 * Toggles a component for the current entity
		 * @param {DAT.GUI.Controller} aController The controller that called this function
		 * @param {Boolean} aValue  Whether to add or remove this component
		 */
		toggleComponent: function( aController, aValue ) {

			var aComponentType = aController.propertyName;
			if(!this._currentBody) {
                console.error("ChuClone.WorldEditor.toggleComponent - _currentBody is null!");
                return;
            }
			var entity = this._currentBody.GetUserData();
			var hasComponent = entity.getComponentWithName( aComponentType ) != null;

			// State has not changed
			if( aValue === hasComponent )
				return;

			if( !aValue ) {
				entity.removeComponentWithName( aComponentType );
			} else if( !entity.getComponentWithName( aComponentType ) ) { // Add only if we don't have it
				entity.addComponentAndExecute( ChuClone.components.ComponentFactory.getComponentByName( aComponentType ) );
			}

			// Do special stuff if we didn't have the component
			this.populateComponentGUI();
		},

        /**
         * Create a new body using lastMousePosition and propProxy data
         * @param e
         */
        onShouldCreate: function(e) {
            var w = this._propProxy.width * PTM_RATIO;
            var h = this._propProxy.height * PTM_RATIO;
            var depth = this._propProxy.depth * PTM_RATIO;

            // Get the new position by dividing the given mouse position by the drawscale, and the result of that by the PTM_RATIO
            var pos = new Box2D.Common.Math.b2Vec2(this._mousePosition.x, this._mousePosition.y);
            pos.Multiply( (1 / this._worldController.getDebugDraw().GetDrawScale()) * PTM_RATIO );

            // Create the b2Body
            var newBody = this._worldController.createRect(
                pos.x,
                pos.y,
                0,
                w,
                h,
                true
            );

            // Create the THREE.js mesh
            var view = this._gameView.createEntityView( this._mousePosition.x, this._mousePosition.x, w, h, depth );
            var entity = new ChuClone.GameEntity();
            entity.setBody( newBody );
            entity.setView( view );
            entity.setDimensions( w, h, depth );

            this._currentBody = newBody;
            this.populateInfoWithB2Body( this._currentBody );
        },

		/**
		 * Destroys a game entity
		 * @param e
		 */
        onShouldDelete: function(e) {
            if(!this._currentBody) {
                console.error("WorldEditor::onShouldDelete - _currentBody is null!");
                return;
            }

            if(!this._currentBody.GetUserData()) {
                console.error("WorldEditor::onShouldDelete - _currentBody.GetUserData() returns null!");
                return;
            }


            // Destroy the old body, and store the current body inside the previous one's entity
            var entity = this._currentBody.GetUserData();
            this._gameView.removeObjectFromScene( entity.getView() );

            entity.dealloc();
            this._worldController.getWorld().DestroyBody( this._currentBody );
            this._currentBody = null;
        },

		/**
		 * Clears the level and dispatches the recreate event
		 */
		onShouldClearLevel: function() {
			var confirm = window.confirm("Clear all level data?");
			if (!confirm) return;

			ChuClone.editor.LevelManager.INSTANCE.clearLevel(this._worldController, this._gameView);
		},

        /**
         * Clones the _currentBody
         */
        onShouldCloneEntity: function(){
            if(!this._currentBody) {
                console.error("WorldEditor::onShouldCloneEntity - _currentBody is null!");
                return;
            }


            // Clone components
            /**
             * @type {ChuClone.GameEntity}
             */
            var clonedEntity = this._currentBody.GetUserData();

            this._mousePosition.x = this._currentBody.GetPosition().x;
            this._mousePosition.y = this._currentBody.GetPosition().y;
            this._mousePosition.Multiply( this._worldController.getDebugDraw().GetDrawScale() );

            this.onShouldCreate(null);

            // Clone previous entities components
            for(var j = clonedEntity.components.length - 1; j >= 0 ; j--) {
                /**
                 * Use the factory to create the components
                 * @type {ChuClone.components.BaseComponent}
                 */
                var componentInstance = ChuClone.components.ComponentFactory.getComponentByName( clonedEntity.components[j].displayName );
                if(!componentInstance) {
                    console.log("ComponentFactory does not contain '" + clonedEntity.components[j].displayName + "'");
                    continue;
                }
                // Allow the component to set any special properties
                componentInstance.fromModel( clonedEntity.components[j].getModel(), clonedEntity );

                // Attach it to the entity
                this._currentBody.GetUserData().addComponentAndExecute( componentInstance );
            }
        },

        /**
         * Mousedown event handler
         * @param {MouseEvent} e
         */
        onMouseDown: function(e) {
            e.preventDefault();
            this.updateMousePosition(e);

			if (e.shiftKey) {
				this._shiftDragHelper = new ChuClone.editor.ShiftDragHelper(this._mousePosition);
			}

            var pos = new Box2D.Common.Math.b2Vec2(this._mousePosition.x, this._mousePosition.y);
            pos.Multiply( 1.0 / this._worldController.getDebugDraw().GetDrawScale() );

            var selectedBody = this.getBodyAtPosition( pos );
			this._currentBody = selectedBody;

            if(selectedBody) {
                this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener( 'mousemove', this._closures['mousemove'], false );
                this._worldController.getDebugDraw().GetSprite().canvas.addEventListener( 'mousemove', this._closures['mousemove'], false );
				this._dragOffset = new Box2D.Common.Math.b2Vec2(pos.x - this._currentBody.GetPosition().x, pos.y - this._currentBody.GetPosition().y);
				this.populateComponentGUI();
            }
        },

        /**
         * @param {MouseEvent} e
         */
        onDraggingPiece: function(e) {
            if( !this._currentBody ) return;


            this.updateMousePosition(e);

			// Shift key is being pressed, but we have no shiftdraghelper
			if (e.shiftKey && !this._shiftDragHelper) {
				this._shiftDragHelper = new ChuClone.editor.ShiftDragHelper(this._mousePosition);
			}

            var pos = new Box2D.Common.Math.b2Vec2(this._mousePosition.x, this._mousePosition.y);
            pos.Multiply( 1.0 / this._worldController.getDebugDraw().GetDrawScale() );
			pos.Subtract( this._dragOffset );

            this._currentBody.SetPosition(pos);
            this._currentBody.GetUserData().onEditorDidDragEntity();

            this.populateInfoWithB2Body( this._currentBody );
        },


        /**
         * Window 'mouseup' callback
         * @param {MouseEvent} e
         */
        onMouseUp: function(e) {
            this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener( 'mousemove', this._closures['mousemove'], false );

			if(this._shiftDragHelper) {
				this._shiftDragHelper.dealloc();
				this._shiftDragHelper = null;
			}
        },


        /**
         * @param {KeyboardEvent} e
         */
        onKeyDown: function(e) {
            var that = this;
			console.log(e.keyCode);

            if(e.keyCode == 32) {
				e.preventDefault();
                if(this._closures['pan']) // already panning
                    return;

                this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener( 'mousemove', this._closures['pan'], false );
                this._worldController.getDebugDraw().GetSprite().canvas.style.cursor = "move";

                var initialMousePosition = null;
                var initialOffsetPosition = new Box2D.Common.Math.b2Vec2( this._worldController.getDebugDraw().offsetX, this._worldController.getDebugDraw().offsetY );
                this._closures['pan'] = function(e) {
                    that.updateMousePosition(e);

                    if(!initialMousePosition) { // First call
                        initialMousePosition = new Box2D.Common.Math.b2Vec2( that._mousePosition.x, that._mousePosition.y );
                    }

                    var scale = (that._worldController.getDebugDraw().GetDrawScale() * 1.5);
                    that._worldController.getDebugDraw().offsetX = initialOffsetPosition.x + (initialMousePosition.x - that._mousePosition.x) / scale;
                    that._worldController.getDebugDraw().offsetY = initialOffsetPosition.y + (initialMousePosition.y - that._mousePosition.y) / scale;
                };

                this._worldController.getDebugDraw().GetSprite().canvas.addEventListener( 'mousemove', this._closures['pan'], false );
            }

			this.handleKeyboardShortcuts(e);
        },

        /**
         * @param {KeyboardEvent} e
         */
        onKeyUp: function(e) {
            if(e.keyCode == 32) {
                this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener( 'mousemove', this._closures['pan'], false );
                this._worldController.getDebugDraw().GetSprite().canvas.style.cursor = "default";
                this._closures['pan'] = null;
            }
        },

		/**
		 * Handles the shortcut keys in the editor
		 * ALT or CTRL + Arrow keys will nudge the Height/Width and X/Y position respectively
		 * @param {KeyboardEvent} e
		 */
		handleKeyboardShortcuts: function( e ) {
			if(e.target.nodeName == "INPUT") {
				//console.dir( e.target);
				//console.log("Ignoring input");
				//console.dir(e.target)
				return;
			}

			if( e.shiftKey && e.type == 'keydown') {
				// d
				if(e.keyCode == 68) {
					this.onShouldDelete()
				} else if (e.keyCode == 67 ) {
					this.onShouldCloneEntity();
				}

				if(e.keyCode == 70) {
					this._controllers['depth'].setValue(this._controllers['depth'].getValue() + ChuClone.utils.randFloat(-1,1));
				}
			}
			// Arrow keys not pressed
			if( e.keyCode < ChuClone.model.Constants.KEYS.LEFT_ARROW || e.keyCode > ChuClone.model.Constants.KEYS.DOWN_ARROW) {
				return;
			}

			// HEIGHT / WIDTH
			if (e.altKey) {
				// Scale height
				if (e.keyCode == ChuClone.model.Constants.KEYS.UP_ARROW || e.keyCode == ChuClone.model.Constants.KEYS.DOWN_ARROW) {
					var delta = e.keyCode == ChuClone.model.Constants.KEYS.UP_ARROW ? 0.25 : -0.25;

					// Amplify if shift is pressed
					if(e.shiftKey) delta *= 4;

					// Set the value and call onControllerWasChanged
					this._controllers['height'].setValue(this._controllers['height'].getValue() + delta);
					this.onControllerWasChanged(null);
				}

				// Scale width
				if (e.keyCode == ChuClone.model.Constants.KEYS.LEFT_ARROW || e.keyCode == ChuClone.model.Constants.KEYS.RIGHT_ARROW) {
					var delta = e.keyCode == ChuClone.model.Constants.KEYS.RIGHT_ARROW ? 0.25 : -0.25;
					// Amplify if shift is pressed
					if(e.shiftKey) delta *= 4;

					// Set the value and call onControllerWasChanged
					this._controllers['width'].setValue(this._controllers['width'].getValue() + delta);
					this.onControllerWasChanged(null);
				}
			}
			// X / Y
			else if( e.ctrlKey ) {
				// Nudge UP/DOWN
				if (e.keyCode == ChuClone.model.Constants.KEYS.UP_ARROW || e.keyCode == ChuClone.model.Constants.KEYS.DOWN_ARROW) {
					var delta = e.keyCode == ChuClone.model.Constants.KEYS.DOWN_ARROW ? 0.25 : -0.25;

					// Amplify if shift is pressed
					if(e.shiftKey) delta *= 4;

					// Set the value and call onControllerWasChanged
					this._controllers['y'].setValue(this._controllers['y'].getValue() + delta);
					this.onControllerWasChanged(null);
				}

				// Nude LEFT/RIGHT
				if (e.keyCode == ChuClone.model.Constants.KEYS.LEFT_ARROW || e.keyCode == ChuClone.model.Constants.KEYS.RIGHT_ARROW) {
					var delta = e.keyCode == ChuClone.model.Constants.KEYS.RIGHT_ARROW ? 0.25 : -0.25;

					// Amplify if shift is pressed
					if(e.shiftKey) delta *= 4;

					// Set the value and call onControllerWasChanged
					this._controllers['x'].setValue(this._controllers['x'].getValue() + delta);
					this.onControllerWasChanged(null);
				}
			}
		},


		/**
		 * Updates the entity to match the new values
		 * @param {Number} newValue Whatever property was changed, this is not explicitely use. We just change all properties to match 'propProxy'
		 */
        onControllerWasChanged: function( newValue ) {


            if(this._currentBody == null) return;
            // Entities properties match our GUI - no change needed
            
            if( !this.entityNeedsUpdate( this._currentBody.GetUserData() ) ) return;

            // Create a new using current body's data
            var newBody = this._worldController.createRect(
                this._controllers['x'].getValue() * PTM_RATIO,
                this._controllers['y'].getValue()  * PTM_RATIO,
                this._currentBody.GetAngle(),
                this._controllers['width'].getValue() * PTM_RATIO,
                this._controllers['height'].getValue() * PTM_RATIO,
                this._currentBody.GetType() == Box2D.Dynamics.b2Body.b2_kinematicBody
            );


            // Destroy the old body, and store the current body inside the previous one's entity
            // NOTE: Assumes GetUserData is of type ChuClone.GameEntity
            var entity = this._currentBody.GetUserData();

            this._worldController.getWorld().DestroyBody( this._currentBody );
            entity.setBody( newBody );
            entity.setDimensions( this._controllers['width'].getValue() * PTM_RATIO, this._controllers['height'].getValue() * PTM_RATIO, this._controllers['depth'].getValue() * PTM_RATIO );

            this._currentBody = newBody;
        },

		/**
		 * Checks the properties of an entity and returns true, if it needs an update to avoid needlessly destroying/recreating objects if we don't need to
		 */
        entityNeedsUpdate: function() {
            var needsChange = false;

            // Get position from platform or entity
            // TODO: THIS IS HACKY - SHOULD NOT NEED TO ASSUME THERE IS SUCH A THING AS MOVING PLATFORMS
            var posx = null;
            var posy = null;
            var movingPlatform = this._currentBody.GetUserData().getComponentWithName(ChuClone.components.MovingPlatformComponent.prototype.displayName);
            if(movingPlatform) {
                posx = movingPlatform._initialPosition.x;
                posy = movingPlatform._initialPosition.y;
            } else {
                posx = this._currentBody.GetPosition().x;
                posy = this._currentBody.GetPosition().y;
            }

            if(posx != this._controllers['x'].getValue()) needsChange = true;
            if(posy != this._controllers['y'].getValue()) needsChange = true;

            var dimensions = this._currentBody.GetUserData().getDimensions();
            if(dimensions.width/PTM_RATIO != this._controllers['width'].getValue()) needsChange = true;
            if(dimensions.height/PTM_RATIO != this._controllers['height'].getValue()) needsChange = true;
            if(dimensions.depth/PTM_RATIO != this._controllers['depth'].getValue()) needsChange = true;

            return needsChange;
        },

        /**
         * Populates the GUI.DAT panel with information about this Box2D Body
         * @param aBody
         */
        populateInfoWithB2Body: function( aBody ) {
            this._controllers['x'].setValue( aBody.GetPosition().x );
            this._controllers['y'].setValue( aBody.GetPosition().y );
            this._controllers['width'].setValue( this._currentBody.GetUserData().getDimensions().width / PTM_RATIO );
            this._controllers['height'].setValue( this._currentBody.GetUserData().getDimensions().height / PTM_RATIO );
            this._controllers['depth'].setValue( this._currentBody.GetUserData().getDimensions().depth / PTM_RATIO );

			// Update component information
			for( var aComponentType in this._toggableComponents ) {
				this._controllers[aComponentType].setValue( this._currentBody.GetUserData().getComponentWithName(aComponentType) != null );
			}
        },

		/**
		 * Called when a new b2Body is selected, modifies the component dropdown to display a list of the components this entity has
		 */
		populateComponentGUI: function() {
			var componentGUI = this._controllers['currentComponent'];
			var selectedIndex = 0;	// Store the selected object, once we create them call set
			ChuClone.utils.repopulateOptionsGUI(this._controllers['currentComponent'], this._currentBody.GetUserData().components, function(aSelectOption, myData, index) {
				aSelectOption.value = index;
				aSelectOption.innerText = myData.displayName;
				aSelectOption.label = myData.displayName.replace("Component", "");

				// If this component has _editableProperties, make it the selected component
				if( Object.keys(myData._editableProperties).length !== 0 ) {
					selectedIndex = index;
					aSelectOption.selected = true;
				}
			});


			// Set to last component that has editable properties
			this._controllers['currentComponent'].setValue( selectedIndex );

		},

        /**
         * Sets the _mousePosition property taking the canvas position into account
         * @param {MouseEvent}  e
         */
        updateMousePosition: function(e) {
            var x = 0,
                y = 0;

            // Get the mouse position relative to the canvas element.
            if (e.layerX || e.layerX == 0) { // Firefox
                x = e.layerX;
                y = e.layerY;
            } else if (e.offsetX || e.offsetX == 0) { // Opera
                x = e.offsetX;
                y = e.offsetY;
            }
            // Offset for canvas
            this._mousePosition.x = x - this._worldController.getDebugDraw().GetSprite().canvas.offsetLeft;// - (this._worldController.getDebugDraw().offsetX/this._worldController.getDebugDraw().GetDrawScale());
            this._mousePosition.y = y - this._worldController.getDebugDraw().GetSprite().canvas.offsetTop;

            // Offset for DEBUGDRAW
            this._mousePosition.x -= this._worldController.getDebugDraw().offsetX*this._worldController.getDebugDraw().GetDrawScale();
            this._mousePosition.y -= this._worldController.getDebugDraw().offsetY*this._worldController.getDebugDraw().GetDrawScale();

			// Allow the shiftDragHelper to constrain the position if we have one
			if( this._shiftDragHelper ) {
				this._mousePosition = this._shiftDragHelper.adjustPosition( this._mousePosition );
			}
        },

        /**
         * Returns the body at a point, point should be scaled relative position already (@see Box2D.Dynamics.b2DebugDraw.GetDrawScale())
         * @param {Box2D.Common.Math.b2Vec2} pos
         * @return {Box2D.Dynamics.b2Body}
         */
        getBodyAtPosition: function(pos) {
            var size = 0.1;
            var aabb = new Box2D.Collision.b2AABB();
            aabb.lowerBound.Set( pos.x - size, pos.y - size );
            aabb.upperBound.Set( pos.x + size, pos.y + size );


            var that = this;
            var selectedBody = null;
            that._worldController.getWorld().QueryAABB(function getBodyCB(fixture) {
                // Only level objects
                if(fixture.GetBody().GetUserData() instanceof ChuClone.GameEntity && fixture.GetBody().GetUserData().getType() != ChuClone.model.Constants.ENTITY_TYPES.PLAYER) {
                    selectedBody = fixture.GetBody();
                    return true;
                }
                return false;
            }, aabb);

            if( selectedBody ) {
                this._currentBody = selectedBody;
                this.populateInfoWithB2Body( selectedBody );
            }

            return selectedBody
        },

        /**
         * Adds a controller to DAT.GUI and adds it into our _controllers object.
         * This function also sets a timeout that will be destroyed if the value is changed while waiting to be fired
         * @param {DAT.GUI} aGui
         * @param {String} propName
         * @param {String|Number|Boolean} initialValue
         * @return {DAT.GUI.Controller}
         */
        addControllerWithTimeout: function(aGui, propName, initialValue) {
            var that = this;
            this._propProxy[propName] = initialValue;

            var controller = aGui.add(this._propProxy, propName);
            this._controllers[propName] = controller;

            // Set a timeout that will be destroyed if the value is changed while waiting to be fired
            controller.onChange( function(newValue) {
                clearTimeout( WAIT_TIMEOUT );
                WAIT_TIMEOUT = setTimeout( function() {
                    that.onControllerWasChanged(newValue);
                }, 600);
            });

            return controller;
        },

        /**
         * Dealloate memory
         */
        dealloc: function() {
            this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener( 'mousedown', this._closures['mousedown'], false );
            this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener('mousemove', this._closures['mousemove'], false );
            window.removeEventListener('mouseup', this._closures['mouseup'], false );

            document.removeEventListener('keydown', this._closures['keydown'], false);
            document.removeEventListener('keypress', this._closures['keypress'], false);
            document.removeEventListener('keyup', this._closures['keyup'], false);

            this._closures = null;

            this._worldController = null;
            this._gameView = null;
            this._currentBody = null;
            this._mousePosition = null;
            this._worldController = null;
            this._guiCamera = null;
            this._guiPlayer = null;
        },

		///// ACCESSORS
		/**
		 * @return {ChuClone.physics.WorldController}
		 */
		getWorldController: function() { return this._worldController; },
		/**
		 * @return {ChuClone.GameViewController}
		 */
		getViewController: function() { return this._gameView; }
	};


	/**
	 * @return {ChuClone.editor.WorldEditor}
	 */
	ChuClone.editor.WorldEditor.getInstance = function() {

		if( instance == null ) {
			debugger;
			throw new Error("ChuClone.editor.WorldEditor.getInstance - No instance!");
		}

		return instance;
	}

})();