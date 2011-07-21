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

			// No editable properties - ignore
			if( Object.keys(aComponent._editableProperties).length === 0 ) {
				console.log("ChuClone.editor.ComponentGUIController - Component has no _editableProperties. Aborting");
				return;
			}

			var componentName = aComponent.displayName;

			// Grab existing one
			var existingGUI = this._allGuis[componentName];
			if( existingGUI ) {
				existingGUI.domElement.style.display = 'block';
				return;
			}


			// Create new one
			var gui = new DAT.GUI({width: ChuClone.model.Constants.EDITOR.PANEL_WIDTH});
			gui.name( componentName );
			gui.autoListen = false;

			// Map to components name
			this._allGuis[componentName] = gui;

			// Add a controller for all properties inside of 'editableProperties'
			for( var prop in aComponent._editableProperties ) {
				var controller = gui.add(aComponent._editableProperties, prop);
				controller.onFinishChange(function() { aComponent.onEditablePropertyWasChanged() });
			}


            gui.close();
            gui.open();
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