(function(){
    ChuClone.GameEntity = function() {
        this.force = new b2Vec2(0,0);
    };

    ChuClone.GameEntity.prototype = {
        view        : null,
        body        : null,
        force       : null,

        update: function() {
            var bodyPos = this.body.GetPosition();
            this.view.position.x = bodyPos.x * ChuClone.Constants.PHYSICS_SCALE;
            this.view.position.y = bodyPos.y * ChuClone.Constants.PHYSICS_SCALE - 150;
            this.view.rotation.z = this.body.GetAngle();// * 57.2957795;
        },

        playerUpdate: function() {
//            if(Math.random() < 0.01) {
            //this.body.ApplyForce(new b2Vec2(0.1, 0), this.body.GetPosition() );

//				this.body.ApplyImpulse( impulse, bodyPosition );
//            }
        },

        setForce: function( aForce ) {
            this.force = aForce;
             var bodyPosition = this.body.GetPosition();
				var angle = 0.1;//Math.atan2( pos.y - bodyPosition.y, pos.x - bodyPosition.x );
				var force = 200;
				var impulse = new b2Vec2( Math.cos(angle) * force, Math.sin(angle) * force);
//            console.log(Math.cos(angle) * force, Math.sin(angle) * force)
        },

        setBody: function( aBody ) {
            this.body = aBody;
        },

        setView: function( aView ) {
            this.view = aView;
        }
    }

})();