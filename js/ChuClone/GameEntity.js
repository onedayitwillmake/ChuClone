/**
 File:
    GameEntity.js
 Created By:
    Mario Gonzalez
 Project    :
    ChuClone
 Abstract:
    Base GameEntity object in ChuClone
 Basic Usage:
    var x = 0;
    var y = -300;
    var boxSize = 30;

    // Create a Physics body for this entity
    var body = this._worldController.createRect( x, y, 0, boxSize, boxSize, false);

    // Create a view for this entity
    var view = this.view.createEntityView( x, y, boxSize * 2, boxSize * 2, boxSize * 2);

    // Create the entity and attach the body and view
    var entity = new ChuClone.GameEntity();
    entity.setBody( body );
    entity.setView( view );

  License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";
    var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;
    var b2Body = Box2D.Dynamics.b2Body;
	var id = 0;
    ChuClone.GameEntity = function() {
        this.components = [];
		this._rememberedVelocity = {speed: -1, time: 0};
		this._id = ++id;
    };

    ChuClone.GameEntity.prototype = {
        /**
         * @type {THREE.Mesh}
         */
        view        : null,

        /**
         * @type {Box2D.Dynamics.b2Body}
         */
        body        : null,

        /**
         * @type {Array}
         */
        components      : null,

        /**
         * @type {Number}
         */
        width       : 0,
        /**
         * @type {Number}
         */
        height      : 0,

		/**
		 * Ineligant fix for double collision
		 * @type {Object}
		 */
		_rememberedVelocity: null,

        /**
         * @type {Number}
         */
        _type       : ChuClone.model.Constants.ENTITY_TYPES.PLATFORM,

		/**
		 * @type {Boolean}
		 */
		_isSavable	: true,



        /**
         * Update the position/rotation based on the BOX2D world position
         * Takes PTM_RATIO into account
         * @param {Number} Alpha    FixedTimestepAccumulatorRatio
         */
        update: function( alpha ) {

            var bodyPos = this.body.GetPosition();

            if( this.body.GetType() === b2Body.b2_kinematicBody ) {
                this.view.position.x = bodyPos.x * PTM_RATIO;
                this.view.position.y = bodyPos.y * -PTM_RATIO;
                this.view.rotation.z = -this.body.GetAngle();
            } else {

				//State state = currentState*alpha + previousState * ( 1.0 - alpha );
                var oneMinusRatio = 1.0 - alpha;
				// New state
                var newX = bodyPos.x * PTM_RATIO;
                var newY = bodyPos.y * -PTM_RATIO;
				var newAngle = -this.body.GetAngle();


                this.view.position.x = (newX * alpha) + this.view.position.x * oneMinusRatio;
                this.view.position.y = (newY * alpha) + this.view.position.y * oneMinusRatio;
                this.view.rotation.z = (newAngle * alpha) + this.view.rotation.z * oneMinusRatio;
            }

            var len = this.components.length;
            for(var i = 0; i < len; ++i ) {
                if( this.components[i].requiresUpdate ) {
                    this.components[i].update();
                }
            }
        },

        /**
         * Called when a collision has occured with another GameEntity
         * Should be overwriten by components
         * @param {ChuClone.GameEntity} otherActor
         */
        onCollision: function( otherActor ) {},


////// COMPONENT LOGIC
        /**
         * Adds and attaches a component, to this entity
         * @param {ChuClone.components.BaseComponent}  aComponent
         * @param {Boolean}	If true will be placed before other components in the array
         * @return {ChuClone.components.BaseComponent}
         */
        addComponent: function(aComponent, insertAsFirst) {
            // Check if we already have this component, if we do - make sure the component allows stacking
            var existingVersionOfComponent = this.getComponentWithName(aComponent.displayName);
            if (existingVersionOfComponent && !existingVersionOfComponent.canStack) {
                //console.debug("GameEntity::addComponent - Not adding '" + aComponent.displayName + "', already exist and canStack = false.");
                return false;
            }

            // Remove existing version
            if (existingVersionOfComponent) {
                this.removeComponentWithName(aComponent.displayName);
            }


			if( !insertAsFirst ) {
            	this.components.push(aComponent);
			} else {
				this.components.unshift(aComponent);
			}

            aComponent.attach(this);

            return aComponent;
        },

        /**
         * Convenience method that calls ChuClone.GameEntity.addComponent then calls execute on the newly created component
         * @param {ChuClone.components.BaseComponent}  aComponent
         * @return {ChuClone.components.BaseComponent}
         */
        addComponentAndExecute: function(aComponent) {
            var wasAdded = this.addComponent(aComponent);
            if (wasAdded) {
                aComponent.execute();
                return aComponent;
            }

            return null;
        },

        /**
         * Returns a component with a matching .displayName property
         * @param aComponentName
         */
        getComponentWithName: function(aComponentName) {
            var len = this.components.length;
            var component = null;
            for (var i = 0; i < len; ++i) {
                if (this.components[i].displayName === aComponentName) {
                    component = this.components[i];
                    break;
                }
            }
            return component;
        },

        /**
         * Removes a component with a matching .displayName property
         * @param {String}  aComponentName
         */
        removeComponentWithName: function(aComponentName) {
            var len = this.components.length;
            var removedComponents = [];
            for (var i = 0; i < len; ++i) {
                if (this.components[i].displayName === aComponentName) {
                    removedComponents.push( this.components.splice(i, 1)[0] );
                    break;
                }
            }

            // Detach removed components
            if (removedComponents) {
                i = removedComponents.length;
                while (i--) {
                    removedComponents[i].detach();
                }
            }
        },

        /**
         * @type {Array}
         */
        getComponents: function() {
            return this.components;
        },

        /**
         * Removes all components contained in this entity (in reverse order)
         */
        removeAllComponents: function() {
            var len = this.components.length;
            while (len) {
                len = len-1;
                this.components[len].detach();
                this.components.splice(len, 1);
            }

            this.components = [];
        },

        ///// EDITOR EVENTS
        /**
         * Called by our attachedEntity when it is dragged in case any of the components need to update something
         */
        onEditorDidDragEntity: function() {
            var len = this.components.length;
            for (var i = 0; i < len; ++i) {
                this.components[i].onEditorDidDragAttachedEntity();
            }
        },


        /**
         * Deallocate
         */
        dealloc: function() {
			if( this.components )
            	this.removeAllComponents();

            this.view = null;

            // If we have a .body and it's pointing to us, null the reference
            if(this.body && this.body.userData == this) {
                this.body.SetUserData(null);
            }
            this.components = null;
            this.body = null;
        },

        ///// ACCESSORS
        /**
         * @return {Box2D.Dynamics.b2Body}
         */
        getBody: function() { return this.body; },
        /**
         * Set the body
         * @param {Box2D.Dynamics.b2Body} aBody
         */
        setBody: function( aBody ) {
            // If we have a .body and it's pointing to us, null the reference
            if(this.body && this.body.userData == this) {
                this.body.SetUserData(null);
            }

            this.body = aBody;
            this.body.SetUserData(this);
        },

        /**
         * Get/Set the three.js view object
         * @param aView
         */
        setView: function( aView ) {
            this.view = aView;
            this.view.geometry.computeBoundingBox();
        },
        /**
         * @return {THREE.Mesh}
         */
        getView: function() { return this.view; },

        getDimensions: function() { return {width: this.width, height: this.height, depth: this.depth }; },

		/**
		 * Sets the dimensions for this view.
		 * Assumes view has cubic geometry
		 * @param {Number} aWidth
		 * @param {Number} aHeight
		 * @param {Number} aDepth
		 */
        setDimensions: function(aWidth, aHeight, aDepth) {
            this.width = aWidth;
            this.height = aHeight;
            this.depth = aDepth;

            // THIS TRICK CURRENTLY ONLY WORKS FOR RECTANGULAR/CUBE ENTITIES
            this.view.dynamic = true;
            this.view.geometry.vertices[0].position = new THREE.Vector3( -aWidth, aHeight, -aDepth );
            this.view.geometry.vertices[1].position = new THREE.Vector3( -aWidth, aHeight, aDepth );
            this.view.geometry.vertices[2].position = new THREE.Vector3( -aWidth, -aHeight, -aDepth );
            this.view.geometry.vertices[3].position = new THREE.Vector3( -aWidth, -aHeight, aDepth );
            this.view.geometry.vertices[4].position = new THREE.Vector3( aWidth, aHeight, aDepth );
            this.view.geometry.vertices[5].position = new THREE.Vector3( aWidth, aHeight, -aDepth );
            this.view.geometry.vertices[6].position = new THREE.Vector3( aWidth, -aHeight, aDepth );
            this.view.geometry.vertices[7].position = new THREE.Vector3( aWidth, -aHeight, -aDepth );


            this.view.geometry.__dirtyVertices = true;
            this.view.geometry.computeBoundingBox();
        },

        getType: function() { return this._type; },
		getId: function() { return this._id; },

		// Prevent or allow this entity to be saved when the level is parsed
		getIsSavable: function() { return this._isSavable; },
		setIsSavable: function( value ) { this._isSavable = value }
    }

})();