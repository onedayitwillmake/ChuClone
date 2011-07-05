(function(){
    "use strict";
    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    ChuClone.GameEntity = function() {
        this.components = [];
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
         * Update the position/rotation based on the BOX2D world position
         * Takes PTM_RATIO into account
         */
        update: function() {
            var bodyPos = this.body.GetPosition();

            this.view.position.x = bodyPos.x * PTM_RATIO;
            this.view.position.y = bodyPos.y * -PTM_RATIO;///((bodyPos.y+this.height/-PTM_RATIO) * -PTM_RATIO) + this.view.geometry.boundingBox.y[0];
            this.view.rotation.z = -this.body.GetAngle();

            var len = this.components.length;
            for(var i = 0; i < len; ++i ) {
                if( this.components[i].requiresUpdate ) {
                    this.components[i].update();
                }
            }
        },

        modifyDimensions: function(aWidth, aHeight) {

        },


////// COMPONENT LOGIC
        /**
         * Adds and attaches a component, to this entity
         * @param {ChuClone.components.BaseComponent}  aComponent
         * @return {ChuClone.components.BaseComponent}
         */
        addComponent: function(aComponent) {
            // Check if we already have this component, if we do - make sure the component allows stacking
            var existingVersionOfComponent = this.getComponentWithName(aComponent.displayName);
            if (existingVersionOfComponent && !existingVersionOfComponent.canStack) {
                return false;
            }

            // Remove existing version
            if (existingVersionOfComponent) {
                this.removeComponentWithName(aComponent.displayName);
            }


            this.components.push(aComponent);
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
         * Removes all components contained in this entity
         */
        removeAllComponents: function() {
            var i = this.components.length;
            while (i--) {
                this.components[i].detach();
            }

            this.components = [];
        },


        /**
         * Deallocate
         */
        dealloc: function() {
            this.view = null;

            // If we have a .body and it's pointing to us, null the reference
            if(this.body && this.body.userData == this) {
                this.body.SetUserData(null);
            }

            this.removeAllComponents();
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
        setDimensions: function(aWidth, aHeight, aDepth) {
            this.width = aWidth;
            this.height = aHeight;
            aDepth = Math.round(aDepth*0.5);
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
        }
    }

})();