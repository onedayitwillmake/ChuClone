(function() {
    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    ChuClone.namespace("ChuClone");
    ChuClone.PlayerEntity = function() {
        ChuClone.PlayerEntity.superclass.constructor.call(this);

        this.addComponentAndExecute( new ChuClone.components.CharacterInputComponent() );
    };

    ChuClone.PlayerEntity.prototype = {
        _isJumping              : false,
        _hasReachedJumpingApex  : false,
        _maxSpeed               : 0.5,

        update: function() {
            ChuClone.PlayerEntity.superclass.update.call(this);
            this.capVelocity();
        },

        capVelocity: function() {
            if(this.body.m_linearVelocity.y < -this._maxSpeed) {
                this.body.m_linearVelocity.y = -this._maxSpeed;
            }
        }

//        checkIsJumping: function() {
//            if(!this._isJumping) return;
//            if(this.body.GetLinearVelocity().y == 0)
//                this._isJumping = false;
//
////			console.log(this.body.GetLinearVelocity().y)
//        },

    };

    ChuClone.extend( ChuClone.PlayerEntity, ChuClone.GameEntity, null );
})();