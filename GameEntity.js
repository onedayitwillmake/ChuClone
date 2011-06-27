(function(){
    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    ChuClone.GameEntity = function() {
        this.force = new Box2D.Common.Math.b2Vec2(0,0);
    };

    ChuClone.GameEntity.prototype = {
        view        : null,
        body        : null,
        force       : null,


        /**
         * Update the position/rotation based on the BOX2D world position
         * Takes PTM_RATIO into account
         */
        update: function() {
            var bodyPos = this.body.GetPosition();
//            this.view.position.x = bodyPos.x * PTM_RATIO;
//            this.view.position.y = (bodyPos.y * PTM_RATIO) + this.view.geometry.boundingBox.y[0];

            this.view.rotation.z = this.body.GetAngle();
        },

        /**
         * Get/Set the b2Body
         */
        getBody: function() { return this.body; },
        setBody: function( aBody ) {
            this.body = aBody;
        },

        /**
         * Get/Set the three.js view object
         * @param aView
         */
        setView: function( aView ) {
            this.view = aView;
            this.view.geometry.computeBoundingBox();
        }
    }

})();