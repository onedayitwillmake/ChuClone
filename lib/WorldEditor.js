(function() {
    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    ChuClone.namespace("ChuClone.editor.WorldEditor");

    /**
     * Creates a new WorldEditor
     * @param {ChuClone.WorldController} aWorldController
     */
    ChuClone.editor.WorldEditor = function( aWorldController ) {
        this._worldController = aWorldController;
        this._mousePosition = new Box2D.Common.Math.b2Vec2(0,0);
        this.setupMouseEvents();
    };

    ChuClone.editor.WorldEditor.prototype = {

        /**
        * @type {ChuClone.WorldController}
        */
        _worldController    : null,
        /**
         * @type {Box2D.Common.Math.b2Vec2}
         */
        _mousePosition      : null,

        setupMouseEvents: function() {
            var that = this;
            window.addEventListener( 'mousedown', function(e){ that.onDocumentMouseDown(e)}, false );
        },

        /**
         * Called by onDocumentMouseDown
         * @param {MouseEvent} e
         */
        onDocumentMouseDown: function(e) {
            this.updateMousePosition(e);

            var pos = new Box2D.Common.Math.b2Vec2(this._mousePosition.x, this._mousePosition.y);
            pos.Multiply( 1.0 / this._worldController.getDebugDraw().GetDrawScale() );

            var selectedBody = this.getBodyAtPosition( pos );
        },
        /**
         * Returns the body at a point, point should be scaled relative position already (@see Box2D.Dynamics.b2DebugDraw.GetDrawScale())
         * // TODO: IMPLEMENT FILTERING?
         * @param {Box2D.Common.Math.b2Vec2} pos
         * @return {Box2D.Dynamics.b2Body}
         */
        getBodyAtPosition: function(pos) {
            var size = 1;
            var aabb = new Box2D.Collision.b2AABB();
            aabb.lowerBound.Set( pos.x - size, pos.y - size );
            aabb.upperBound.Set( pos.x + size, pos.y + size );


            var that = this;
            var selectedBody = null;
            that._worldController.getWorld().QueryAABB(function getBodyCB(fixture) {
//                if (fixture.GetBody().GetType() == Box2D.Dynamics.b2Body.b2_dynamicBody) {
                    if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), pos)) {
                        selectedBody = fixture.GetBody();
                        return false;
                    }
//                }
                return false;
            }, aabb);

            return selectedBody
        },

        /**
         * Sets the _mousePosition property taking the canvas position into account
         * @param {MouseEvent}  e
         */
        updateMousePosition: function(e) {
			var x = 0,
				y = 0;

			// Get the mouse position relative to the canvas element.
			if (e.layerX || e.layerX == 0) { // Firefox
				x = e.layerX;
				y = e.layerY;
			} else if (e.offsetX || e.offsetX == 0) { // Opera
				x = e.offsetX;
				y = e.offsetY;
			}
			// Offset
			this._mousePosition.x = x - this._worldController.getDebugDraw().GetSprite().canvas.offsetLeft;
			this._mousePosition.y = y - this._worldController.getDebugDraw().GetSprite().canvas.offsetTop;
		}
    }
})();