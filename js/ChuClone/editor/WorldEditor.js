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

        this.setupMouseEvents();
        this.setupKeyboardEvents();
        this.setupGui();

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

                            // Store reference for remval later: HACK?
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

            this._worldController.getDebugDraw().GetSprite().canvas.addEventListener( 'mousewheel', function(e){
                var speed = (e.wheelDelta < 0) ? -1 : 1;
                speed *= 0.1;

                var scale = that._worldController.getDebugDraw().GetDrawScale();
                scale += speed;
                that._worldController.getDebugDraw().SetDrawScale( scale );

				e.preventDefault();
            }, false );


        },

        /**
         * Sets up keyboard related event callbacks
         */
        setupKeyboardEvents: function() {
            var that = this;

            this._closures['keydown'] = function(e) { that.onKeyDown(e); };
            this._closures['keyup'] = function(e) { that.onKeyUp(e); };

            document.addEventListener('keydown', this._closures['keydown'], false);
            document.addEventListener('keyup', this._closures['keyup'], false);
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
            this.addControllerWithTimeout(this._guiModification, "width", this._propProxy.width).min(0.01).max(Math.round(3000/PTM_RATIO)).step(0.05);
            this.addControllerWithTimeout(this._guiModification, "height", this._propProxy.height).min(0.01).max(Math.round(3000/PTM_RATIO)).step(0.05);
            this.addControllerWithTimeout(this._guiModification, "depth", this._propProxy.depth).min(0.01).max(3000/PTM_RATIO).step(0.05);

			// Add a dropdown box to modify which component is being edited
			this._controllers['currentComponent'] = this._guiModification.add(this, '_currentEditedComponent').name("Components")
            this._controllers['currentComponent'].options.apply( this._controllers['currentComponent'], [	]);
            this._controllers['currentComponent'].onChange( function( selectedIndex ) {

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
			this._toggableComponents[ChuClone.components.AutoRotationComponent.prototype.displayName] = ChuClone.components.AutoRotationComponent;
			this._toggableComponents[ChuClone.components.MovingPlatformComponent.prototype.displayName] = ChuClone.components.MovingPlatformComponent;

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
                componentInstance.fromModel( clonedEntity.components[j].getModel() );

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

            var pos = new Box2D.Common.Math.b2Vec2(this._mousePosition.x, this._mousePosition.y);
            pos.Multiply( 1.0 / this._worldController.getDebugDraw().GetDrawScale() );

            var selectedBody = this.getBodyAtPosition( pos );

            if(selectedBody) {
                this._currentBody = selectedBody;
                this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener( 'mousemove', this._closures['mousemove'], false );
                this._worldController.getDebugDraw().GetSprite().canvas.addEventListener( 'mousemove', this._closures['mousemove'], false );
				this.populateComponentGUI();
            }
        },

        /**
         * @param {MouseEvent} e
         */
        onDraggingPiece: function(e) {
            if( !this._currentBody ) return;
            this.updateMousePosition(e);

            var pos = new Box2D.Common.Math.b2Vec2(this._mousePosition.x, this._mousePosition.y);
            pos.Multiply( 1.0 / this._worldController.getDebugDraw().GetDrawScale() );

            this._currentBody.SetPosition(pos);
            this.populateInfoWithB2Body( this._currentBody );
        },

        /**
         * Window 'mouseup' callback
         * @param {MouseEvent} e
         */
        onMouseUp: function(e) {
            this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener( 'mousemove', this._closures['mousemove'], false );
//            this.updateMousePosition(e);
        },


        /**
         * @param {KeyboardEvent} e
         */
        onKeyDown: function(e) {
            var that = this;

            if(e.keyCode == 32) {
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
                    that._worldController.getDebugDraw().offsetY = initialOffsetPosition.y + (initialMousePosition.y - that._mousePosition.y) / scale;	1
                };

                this._worldController.getDebugDraw().GetSprite().canvas.addEventListener( 'mousemove', this._closures['pan'], false );
            }
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
		 * Updates the entity to match the new values
		 * @param {Number} newValue Whatever property was changed, this is not explicitely use. We just change all properties to match 'propProxy'
		 */
        onControllerWasChanged: function( newValue ) {
            if(this._currentBody == null) return;

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

			// Remove all current 'options' from the HTMLSelect element
			/**
			 * @type {HTMLSelectElement}
			 */
			var selectElement = componentGUI.domElement.lastChild;
			while (selectElement.firstChild) {
				selectElement.removeChild(selectElement.firstChild);
			}


			// For each component this entity has - add an HTMLOptionElement to the drop down
			var allComponents = this._currentBody.GetUserData().components;
			var len = allComponents.length;
			var selectedIndex = 0;
			for( var i = 0; i < len; ++i ) {
				var aComponent = allComponents[i];

				/**
				 * @type {HTMLOptionElement}
				 */
				var selectOption = document.createElement('option');
				selectOption.value = i;
				selectOption.innerText = aComponent.displayName;
				selectOption.label = aComponent.displayName.replace("Component", "");
				// Add it to the select options
				// .push does not work, but appending using the length does?
				var optionsLength = selectElement.options.length;
					selectElement.options[optionsLength] = selectOption;

				// Set to last component that has editable properties
				if( Object.keys(aComponent._editableProperties).length !== 0 ) {
					selectedIndex = i;
					selectOption.selected = true;
				}
			}

			// Trigger on change event
			componentGUI.setValue(selectedIndex);
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

        removeController: function( propName ) {
            // TODO: Not Implemented
        },


        dealloc: function() {
            this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener( 'mousedown', this._closures['mousedown'], false );
            this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener('mousemove', this._closures['mousemove'], false );
            window.removeEventListener('mouseup', this._closures['mouseup'], false );

            document.removeEventListener('keydown', this._closures['keydown'], false);
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