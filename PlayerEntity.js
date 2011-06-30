(function() {
    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    ChuClone.PlayerEntity = function() {
        ChuClone.PlayerEntity.superclass.constructor.call(this)
    };

    ChuClone.PlayerEntity.prototype = {
		_isJumping: false,
		_hasReachedJumpingApex: false,

        keys: {
            left: false,
            right: false,
            up: false,
            down: false
        },

        handleKeyDown: function( e ) {

            if( e.keyCode == ChuClone.Constants.KEYS.LEFT || e.keyCode == ChuClone.Constants.KEYS.A ) this.keys.left = true;
            else if(  e.keyCode == ChuClone.Constants.KEYS.RIGHT || e.keyCode == ChuClone.Constants.KEYS.D ) this.keys.right = true;
            if( e.keyCode == ChuClone.Constants.KEYS.UP || e.keyCode == ChuClone.Constants.KEYS.W ) this.keys.up = true;
            else if( e.keyCode == ChuClone.Constants.KEYS.DOWN || e.keyCode == ChuClone.Constants.KEYS.S ) this.keys.down = true;
        },

        handleKeyUp: function(e) {
            if( e.keyCode == ChuClone.Constants.KEYS.LEFT || e.keyCode == ChuClone.Constants.KEYS.A ) this.keys.left = false;
            else if(  e.keyCode == ChuClone.Constants.KEYS.RIGHT || e.keyCode == ChuClone.Constants.KEYS.D ) this.keys.right = false;
            if( e.keyCode == ChuClone.Constants.KEYS.UP || e.keyCode == ChuClone.Constants.KEYS.W ) this.keys.up = false;
            else if( e.keyCode == ChuClone.Constants.KEYS.DOWN || e.keyCode == ChuClone.Constants.KEYS.S ) this.keys.down = false;
        },

        update: function() {
            ChuClone.PlayerEntity.superclass.update.call(this);
            this.applyInput();
			this.checkIsJumping();
        },

        /**
         * Applies a force based based on the keyboard state
         * TODO: DISABLE JUMP?
         */
        applyInput: function() {
            var force = new Box2D.Common.Math.b2Vec2(0,0);
            if( this.keys.left ) force.x = -1;
            else if( this.keys.right ) force.x = 1;
            if( this.keys.up && !this._isJumping ) {
				force.y = -1;
				this._isJumping = true;
			} else if( this.keys.down ) force.y = 1;

            // Apply force
            var bodyPosition = this.body.GetWorldCenter();
            var impulse = new Box2D.Common.Math.b2Vec2( 0.01 * PTM_RATIO * this.body.GetMass() * force.x, 0.3 * PTM_RATIO * this.body.GetMass() * force.y );
            this.body.ApplyImpulse( impulse, bodyPosition );
        },

		checkIsJumping: function() {
			if(!this._isJumping) return;

//			var that = this;
//			if(!this._hasReachedJumpingApex && this.body.GetLinearVelocity().y >= 0.0)
//			    setTimeout( function() {
//					if(that.aboutToApex) {
//						that._hasReachedJumpingApex = true;
//						that.aboutToApex = false;
//					}
//				}, 1000);
//
//			console.log(this.aboutToApex)
//			if(this._hasReachedJumpingApex )
//				console.log("Waiting to fall:", Math.round(this.body.GetLinearVelocity().y*100));
//

//			if()
//			if()
			if(this.body.GetLinearVelocity().y == 0)
				this._isJumping = false;

//			console.log(this.body.GetLinearVelocity().y)
		},

		setBody: function( aBody ) {
			ChuClone.PlayerEntity.superclass.setBody.call(this, aBody );
		}

    };

    ChuClone.extend( ChuClone.PlayerEntity, ChuClone.GameEntity, null );
})();