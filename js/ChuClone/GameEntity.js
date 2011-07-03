(function(){
    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    ChuClone.GameEntity = function() {
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
            this.view.position.y = (bodyPos.y * -PTM_RATIO) + this.view.geometry.boundingBox.y[0];

            this.view.rotation.z = -this.body.GetAngle();
        },

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

        getDimensions: function() { return {width: this.width, height: this.height}; },
        setDimensions: function(aWidth, aHeight) {
            this.width = aWidth;
            this.height = aHeight;
        },


        modifyDimensions: function(aWidth, aHeight) {

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

            this.body = null;
        }
    }

})();