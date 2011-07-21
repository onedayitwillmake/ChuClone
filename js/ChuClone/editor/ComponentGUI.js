(function() {
	ChuClone.namespace("ChuClone.editor");
	ChuClone.editor.ComponentGUIController = function() {

	};

	ChuClone.editor.ComponentGUIController.prototype = {

		/**
		 * A reference to the component currently being edited
		 * @type {ChuClone.components.BaseComponent}
		 */
		_activeComponent    : null,
		_allGuis			: {},

		setupGUIForComponent: function( aComponent ) {
			this._activeComponent = aComponent;
			this.hideAll();

			// No editable properties - ignore
			if( Object.keys(aComponent._editableProperties).length === 0 ) {
				console.log("ChuClone.editor.ComponentGUIController - Component has no _editableProperties. Aborting");
				return;
			}

			var componentName = aComponent.displayName;

			// Grab existing one
			var existingGUI = this._allGuis[componentName];
			if( existingGUI ) {
				this.prepareAndShowGUI( existingGUI );
				return;
			}


			// Create new one
			var gui = new DAT.GUI({width: ChuClone.model.Constants.EDITOR.PANEL_WIDTH});
			gui.componentControllers = {};
			gui.name( componentName );
			gui.autoListen = false;

			// Map to components name
			this._allGuis[componentName] = gui;

			// Add a controller for all properties inside of 'editableProperties'
			for( var prop in aComponent._editableProperties ) {

				var controller = null;
				var value;

				// Wants a slider
				if(aComponent._editableProperties[prop].hasOwnProperty('value')) {
					controller = gui.add(aComponent._editableProperties[prop], 'value');
					controller.min(aComponent._editableProperties[prop].min);
					controller.max(aComponent._editableProperties[prop].max);
					value = aComponent._editableProperties[prop].value;
				} else {
					controller = gui.add(aComponent._editableProperties, prop);
					value = aComponent._editableProperties[prop];
				}
				controller.setValue(value);

				gui.componentControllers[prop] = controller;
				controller.onChange(function() {
					console.log("CHANGE!", aComponent);
					aComponent.onEditablePropertyWasChanged()
				});
			}


            gui.close();
            gui.open();
		},

		/**
		 * Sets up the current GUI
		 */
		prepareAndShowGUI: function( existingGUI ) {

			existingGUI.domElement.style.display = 'block';

			for( var prop in this._activeComponent._editableProperties ) {
				// Get value from property's 'value' property or use the property itself (editableProperties: {a: 1, b: {value: 10, min:1, max:10} })
				var value;
				if(this._activeComponent._editableProperties[prop].hasOwnProperty('value')) {
					value = this._activeComponent._editableProperties[prop].value;
				} else {
					value = this._activeComponent._editableProperties[prop];
				}

				// Temporarily remove the changeFunction callback, set the value, and then set the callback again
				var F = existingGUI.componentControllers[prop].changeFunction;
				existingGUI.componentControllers[prop].changeFunction = null;
				existingGUI.componentControllers[prop].setValue(value);
				existingGUI.componentControllers[prop].changeFunction = F;
			}
		},

		hideAll: function() {
			for(var prop in this._allGuis ) {
				this._allGuis[prop].domElement.style.display = 'none';
			}
		},

		/**
		 * Deallocate memory, destroy all DAT.GUI instances
		 */
		dealloc: function() {
			for(var prop in this._allGuis ) {
				this._allGuis[prop].domElement.parentNode.removeChild(this._allGuis[prop].domElement);
			}
		}
	};

})();