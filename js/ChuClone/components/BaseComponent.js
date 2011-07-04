/**
 File:
 BaseComponent.js
 Created By:
 Mario Gonzalez
 Project    :
 ChuClone
 Abstract:
 Components work by effectively 'hi-jacking' properties of their attachedEntity.
 These properties can by functions, or non-primitive data types.

 Instead of creating a new trivial subclass, considering creating a component and attaching it to that object

 For example to make an entity invincible for a period of time you might make a component like this

 [PSUEDO CODE START]
 // Inside a component subclass
 attach: function(anEntity)
 {
 this.callSuper();
 this.intercept(['onHit', 'getShotPower']);
 },

 onHit: function() {
 // Do nothing, im invincible!
 },

 getShotStrength: function() {
 return 100000000; // OMGBBQ! Thats high!
 }
 [PSUEDO CODE END]

 Be sure to call restore before detaching the component!

 Basic Usage:

 // Let my character be controlled by the KB
 if(newEntity.connectionID === this.netChannel.connectionID) {
 aCharacter.addComponentAndExecute( new ClientControlledComponent() );
 this.clientCharacter = aCharacter;
 }
 */
(function() {
    ChuClone.namespace("ChuClone.components");

    ChuClone.components.BaseComponent = function() {
        this.interceptedProperties = {};
        return this;
    };

    ChuClone.components.BaseComponent.prototype = {
        /**
         * Array of properties intercepted, this is used when detaching the component
         * @type {Array}
         */
        interceptedProperties    : null,
        /**
         * @type {ChuClone.GameEntity}
         */
        attachedEntity            : null,
        /**
         * @type {Number}
         */
        detachTimeout            : 0,
        /**
         * Unique name for this component
         * @type {String}
         */
        displayName                : "BaseComponent",

        /**
         * If a component can stack, then it doesn't matter if it's already attached.
         * If it cannot stack, it is not applied if it's currently active.
         * For example, you can not be frozen after being frozen.
         * However you can be sped up multiple times.
         *
         * @type {Boolean}
         */
        canStack                : false,

        /**
         * Attach the component to the host object
         * @param {ChuClone.GameEntity} anEntity
         */
        attach: function(anEntity) {
            this.attachedEntity = anEntity;
        },

        /**
         * Execute the component
         * For example if you needed to cause an animation to start when a character is 'unfrozen', this is when you would do it
         */
        execute: function() {

        },

        /**
         * Detaches a component from an 'attachedEntity' and restores the properties
         */
        detach: function() {
            clearTimeout(this.detachTimeout);
            this.restore();

            this.interceptedProperties = null;
            this.attachedEntity = null;
        },

        /**
         * Detach after N milliseconds, for example freeze component might call this to unfreeze
         * @param {Number} aDelay
         */
        detachAfterDelay: function(aDelay) {
            var that = this;
            this.detachTimeout = setTimeout(function() {
                that.attachedEntity.removeComponentWithName(that.displayName);
            }, aDelay);
        },

        /**
         * Intercept properties from the entity we are attached to.
         * For example, if we intercept handleInput, then our own 'handleInput' function gets called.
         * We can reset all the properties by calling, this.restore();
         * @param {Array} arrayOfProperties
         */
        intercept: function(arrayOfProperties) {
            var len = arrayOfProperties.length;
            var that = this;
            while (len--) {
                var aKey = arrayOfProperties[len];
                this.interceptedProperties[aKey] = this.attachedEntity[aKey];

                // Wrap function calls in closure, if not just overwrite
                if(this.attachedEntity[aKey] instanceof Function) {
                    this.attachedEntity[aKey] = function(){
                        that[aKey].apply(that, arguments);
                    }
                } else {
                    this.attachedEntity[aKey] = this[aKey];
                }

            }
        },

        /**
         * Restores components that were intercepted.
         * Be sure to call this when removing the component!
         */
        restore: function() {
            for (var key in this.interceptedProperties) {
                if (this.interceptedProperties.hasOwnProperty(key)) {
                    this.attachedEntity[key] = this.interceptedProperties[key];
                }
            }
        },

        getModel: function() {
            return {
                displayName: this.displayName
            }
        }
        
    }
})();