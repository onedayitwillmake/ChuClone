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
    lookup[ChuClone.components.FrictionPadComponent.prototype.displayName] = ChuClone.components.FrictionPadComponent;
    lookup[ChuClone.components.MovingPlatformComponent.prototype.displayName] = ChuClone.components.MovingPlatformComponent;
	lookup[ChuClone.components.AutoRotationComponent.prototype.displayName] = ChuClone.components.AutoRotationComponent;
    lookup[ChuClone.components.KeyboardInputComponent.prototype.displayName] = ChuClone.components.KeyboardInputComponent;
    lookup[ChuClone.components.PhysicsVelocityLimitComponent.prototype.displayName] = ChuClone.components.PhysicsVelocityLimitComponent;
    lookup[ChuClone.components.CheckIsJumpingComponent.prototype.displayName] = ChuClone.components.CheckIsJumpingComponent;
    lookup[ChuClone.components.camera.CameraFocusRadiusComponent.prototype.displayName] = ChuClone.components.camera.CameraFocusRadiusComponent;
    lookup[ChuClone.components.camera.CameraFollowEditorComponent.prototype.displayName] = ChuClone.components.camera.CameraFollowEditorComponent;
    lookup[ChuClone.components.camera.CameraFollowPlayerComponent.prototype.displayName] = ChuClone.components.camera.CameraFollowPlayerComponent;
	lookup[ChuClone.components.effect.ParticleEmitterComponent.prototype.displayName] = ChuClone.components.effect.ParticleEmitterComponent;



    ChuClone.components.ComponentFactory = {
        getComponentByName: function( displayName ) {
            if(lookup[displayName]) {
                return new lookup[displayName]();
            }

            return null;
        },
    };
})();