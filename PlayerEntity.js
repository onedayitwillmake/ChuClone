(function() {
    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    ChuClone.PlayerEntity = function() {
        ChuClone.PlayerEntity.superclass.constructor.call(this)
    };

    ChuClone.PlayerEntity.prototype = {
        keys: {
            left: false,
            right: false,
            up: false,
            down: false
        },

        handleKeyDown: function( e ) {

            if( e.keyCode == ChuClone.Constants.KEYS.LEFT ) this.keys.left = true;
            else if(  e.keyCode == ChuClone.Constants.KEYS.RIGHT ) this.keys.right = true;
            if( e.keyCode == ChuClone.Constants.KEYS.UP ) this.keys.up = true;
            else if( e.keyCode == ChuClone.Constants.KEYS.DOWN ) this.keys.down = true;
        },

        handleKeyUp: function(e) {
            if( e.keyCode == ChuClone.Constants.KEYS.LEFT ) this.keys.left = false;
            else if(  e.keyCode == ChuClone.Constants.KEYS.RIGHT ) this.keys.right = false;
            if( e.keyCode == ChuClone.Constants.KEYS.UP ) this.keys.up = false;
            else if( e.keyCode == ChuClone.Constants.KEYS.DOWN ) this.keys.down = false;
        },

        update: function() {
            ChuClone.PlayerEntity.superclass.update.call(this);
            this.applyInput();
        },

        /**
         * Applies a force based based on the keyboard state
         * TODO: DISABLE JUMP?
         */
        applyInput: function() {
            var force = new Box2D.Common.Math.b2Vec2(0,0);
            if( this.keys.left ) force.x = -1;
            else if( this.keys.right ) force.x = 1;
            if( this.keys.up ) force.y = 1;
            else if( this.keys.down ) force.y = -1;

            // Apply force
            var bodyPosition = this.body.GetWorldCenter();
            var impulse = new Box2D.Common.Math.b2Vec2( 0.05 * PTM_RATIO * this.body.GetMass() * force.x, 0.03 * PTM_RATIO * this.body.GetMass() * force.y );
            this.body.ApplyImpulse( impulse, bodyPosition );
        }

    };

    ChuClone.extend( ChuClone.PlayerEntity, ChuClone.GameEntity, null );
})();