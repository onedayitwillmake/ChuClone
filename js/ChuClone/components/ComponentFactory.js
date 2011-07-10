/**
 File:
    ComponentFactory.js
 Created By:
    Mario Gonzalez
 Project    :
    ChuClone
 Abstract:
    Component factory stores a private lookup of all Component constructor functions by their display name,
    which it can then use instantiate a component and return it
 Basic Usage:
     // Attach all components in reverse order
     for(var j = entityInfo.components.length - 1; j >= 0 ; j--) {

        // Use the factory to create the component by the name 'JumpPadComponent'
        var componentInstance = ChuClone.components.ComponentFactory.getComponentByName(entityInfo.components[j].displayName);

        // Allow the component to set any special properties
        componentInstance.fromModel(entityInfo.components[j]);

        // Attach it to the entity
        entity.addComponentAndExecute(componentInstance);
    }

 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function() {
    "use strict";
    
    ChuClone.namespace("ChuClone.components");

    // Store a reference to the constructor function for each component by using it's name
    var lookup = {};
    lookup[ChuClone.components.CharacterControllerComponent.prototype.displayName] = ChuClone.components.CharacterControllerComponent;
    lookup[ChuClone.components.JumpPadComponent.prototype.displayName] = ChuClone.components.JumpPadComponent;
    lookup[ChuClone.components.RespawnComponent.prototype.displayName] = ChuClone.components.RespawnComponent;
    lookup[ChuClone.components.GoalPadComponent.prototype.displayName] = ChuClone.components.GoalPadComponent;
    lookup[ChuClone.components.KeyboardInputComponent.prototype.displayName] = ChuClone.components.KeyboardInputComponent;
    lookup[ChuClone.components.PhysicsVelocityLimitComponent.prototype.displayName] = ChuClone.components.PhysicsVelocityLimitComponent;
    lookup[ChuClone.components.CheckIsJumpingComponent.prototype.displayName] = ChuClone.components.CheckIsJumpingComponent;


    ChuClone.components.ComponentFactory = {
        getComponentByName: function( displayName ) {
            if(lookup[displayName]) {
                return new lookup[displayName]();
            }

            return null;
        },

        /**
         * Registers a component with the ComponentFactory.
         * This should be called by all components 
         * @param aComponent
         */
        registerComponent: function( aComponent ) {
            // TODO: REGISTERING COMPONENTS
        }
    };
})();