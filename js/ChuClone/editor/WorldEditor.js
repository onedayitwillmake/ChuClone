(function() {
    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    var WAIT_TIMEOUT = 0;

    ChuClone.namespace("ChuClone.editor");

    /**
     * Creates a new WorldEditor
     * @param {ChuClone.WorldController} aWorldController
     */
    ChuClone.editor.WorldEditor = function( aWorldController, aGameView ) {
        this._worldController = aWorldController;
        this._gameView = aGameView;
        this._mousePosition = new Box2D.Common.Math.b2Vec2(0,0);

        this.setupMouseEvents();
        this.setupKeyboardEvents();
        this.setupGui();
        this.setupLevelManager();

        //this.onShouldCreate();
    };

    ChuClone.editor.WorldEditor.prototype = {
        /**
         * @type {ChuClone.WorldController}
         */
        _worldController    : null,
        /**
         * @type {ChuClone.GameView}
         */
        _gameView           : null,
        /**
         * @type {Box2D.Common.Math.b2Vec2}
         */
        _mousePosition      : null,
        /**
         * The currently edited b2Body
         * @type {Box2D.Dynamics.b2Body}
         */
        _currentBody        : null,
        /**
         * @type {DAT.GUI}
         */
        _guiModification    : null,
        /**
         * We modify this not the b2Body directly
         */
        _propProxy          : {x: 5, y: 5, width: 3, height:3, depth: 3, jumpPad: false },
        _controllers        : {},

                            // Store reference for remval later: HACK?
        _closures           : {'mousemove':null, 'mouseup':null, 'mousedown': null},

        setupMouseEvents: function() {
            var that = this;
            this._closures['mousedown'] = function(e) { that.onMouseDown(e); };
            this._closures['mousemove'] = function(e) { that.onDraggingPiece(e); };
            this._closures['mouseup'] = function(e) { that.onMouseUp(e); };

            this._worldController.getDebugDraw().GetSprite().canvas.addEventListener( 'mousedown', this._closures['mousedown'], false );
            window.addEventListener( 'mouseup', this._closures['mouseup'], false );

            this._worldController.getDebugDraw().GetSprite().canvas.addEventListener( 'mousewheel', function(e){

                var speed = (e.wheelDelta < 0) ? -1 : 1;
                speed *= 0.1;

                var scale = that._worldController.getDebugDraw().GetDrawScale();
                scale += speed;
                that._worldController.getDebugDraw().SetDrawScale( scale );


//                that.updateMousePosition(e)
                // Offset for canvas
               // that._mousePosition.x = x - that._worldController.getDebugDraw().GetSprite().canvas.offsetLeft;// - (this._worldController.getDebugDraw().offsetX/this._worldController.getDebugDraw().GetDrawScale());
               // that._mousePosition.y = y - that._worldController.getDebugDraw().GetSprite().canvas.offsetTop;

                // Offset for DEBUGDRAW
//                that._mousePosition.x -= that._worldController.getDebugDraw().offsetX*that._worldController.getDebugDraw().GetDrawScale();
//                that._mousePosition.y -= that._worldController.getDebugDraw().offsetY*that._worldController.getDebugDraw().GetDrawScale();


//                console.log(that._worldController.getDebugDraw().GetSprite().canvas.offsetX)
//                console.log(e.layerX, e.offsetX)
//                console.log(newY)
//                console.log(scale*0.01);

//                that._worldController.setDebugDrawOffset( that._mousePosition.x, that._mousePosition.y );
            }, false );
        },

        setupKeyboardEvents: function() {
            var that = this;

            this._closures['keydown'] = function(e) { that.onKeyDown(e); };
            this._closures['keyup'] = function(e) { that.onKeyUp(e); };

            document.addEventListener('keydown', this._closures['keydown'], false);
            document.addEventListener('keyup', this._closures['keyup'], false);
        },


        /**
         * Setup DAT.GUI controllers
         */
        setupGui: function() {
            var that = this;
            this._guiModification = new DAT.GUI();
            this._guiModification.name("Modification");
            this._guiModification.autoListen = false;

            this.addControllerWithTimeout(this._guiModification, "x", this._propProxy.x).step(0.1);
            this.addControllerWithTimeout(this._guiModification, "y", this._propProxy.y).step(0.1);
            this.addControllerWithTimeout(this._guiModification, "width", this._propProxy.width).min(0.01).max(Math.round(5000/PTM_RATIO)).step(0.05);
            this.addControllerWithTimeout(this._guiModification, "height", this._propProxy.height).min(0.01).max(Math.round(5000/PTM_RATIO)).step(0.05);
            this.addControllerWithTimeout(this._guiModification, "depth", this._propProxy.depth).min(50).max(5000).step(10);
            this._controllers['jumpPad'] = this._guiModification.add(this._propProxy, "jumpPad");
            this._controllers['jumpPad'].onChange( function(aValue){ that.toggleJumpPad(aValue); } );
            this._guiModification.close();
            this._guiModification.open();

            // Creation gui
            this._guiCreation = new DAT.GUI();
            this._guiCreation.name("Creation");
            this._guiCreation.autoListen = false;
            this._controllers['onShouldCreate'] = this._guiCreation.add(this, 'onShouldCreate').name("Create Entity");
            this._controllers['onShouldClone'] = this._guiCreation.add(this, 'onShouldCloneEntity').name("Clone Entity")
            this._controllers['onShouldDelete'] = this._guiCreation.add(this, 'onShouldDelete').name("Destroy Entity");

            this._guiCreation.close();
            this._guiCreation.open();
        },

        setupLevelManager: function() {
            this._levelManager = new ChuClone.editor.LevelManager( this._worldController );
            this._levelManager.setupGui();
        },

        toggleJumpPad: function( wantsJumpPad ) {
            if(!this._currentBody) {
                console.error("ChuClone.WorldEditor.toggleJumpPad - _currentBody is null!");
                return;
            }

            var entity = this._currentBody.GetUserData();
            var hasJumpPad = entity.getComponentWithName( ChuClone.components.JumpPadComponent.prototype.displayName ) == null;

            if( !wantsJumpPad ) {
                entity.removeComponentWithName( ChuClone.components.JumpPadComponent.prototype.displayName );
            } else {
                var jumpPadComponent = new ChuClone.components.JumpPadComponent();
                entity.addComponentAndExecute( jumpPadComponent );
            }
        },

        /**
         * Create a new body using lastMousePosition and propProxy data
         * @param e
         */
        onShouldCreate: function(e) {
            var w = this._propProxy.width * PTM_RATIO;
            var h = this._propProxy.height * PTM_RATIO;

            // Get the new position by dividing the given mouse position by the drawscale, and the result of that by the PTM_RATIO
            var pos = new Box2D.Common.Math.b2Vec2(this._mousePosition.x, this._mousePosition.y);
            pos.Multiply( (1 / this._worldController.getDebugDraw().GetDrawScale()) * PTM_RATIO );

            // Create the b2Body
            var newBody = this._worldController.createRect(
                pos.x,
                pos.y,
                0,
                w,
                h,
                true
            );

            // Create the THREE.js mesh
            var view = this._gameView.createEntityView( this._mousePosition.x, this._mousePosition.x, w*2, h*2, ChuClone.Constants.ENTITIES.DEFAULT_DEPTH  );
            var entity = new ChuClone.GameEntity();
            entity.setBody( newBody );
            entity.setView( view );
            entity.setDimensions( w, h, ChuClone.Constants.ENTITIES.DEFAULT_DEPTH);

            this._currentBody = newBody;
            this.populateInfoWithB2Body( this._currentBody );
        },

        onShouldDelete: function(e) {
            if(!this._currentBody) {
                console.error("WorldEditor::onShouldDelete - _currentBody is null!");
                return;
            }

            if(!this._currentBody.GetUserData()) {
                console.error("WorldEditor::onShouldDelete - _currentBody.GetUserData() returns null!");
                return;
            }


            // Destroy the old body, and store the current body inside the previous one's entity
            var entity = this._currentBody.GetUserData();
            this._gameView.removeEntity( entity.getView() );

            entity.dealloc();
            this._worldController.getWorld().DestroyBody( this._currentBody );
            this._currentBody = null;
        },

        /**
         * Clones the _currentBody
         */
        onShouldCloneEntity: function(){
            this._mousePosition.x = this._currentBody.GetPosition().x;
            this._mousePosition.y = this._currentBody.GetPosition().y;
            this._mousePosition.Multiply( this._worldController.getDebugDraw().GetDrawScale() );

            this.onShouldCreate(null);
        },

        /**
         * Mousedown event handler
         * @param {MouseEvent} e
         */
        onMouseDown: function(e) {
            e.preventDefault();
            this.updateMousePosition(e);

            var pos = new Box2D.Common.Math.b2Vec2(this._mousePosition.x, this._mousePosition.y);
            pos.Multiply( 1.0 / this._worldController.getDebugDraw().GetDrawScale() );

            var selectedBody = this.getBodyAtPosition( pos );

            if(selectedBody) {
                this._currentBody = selectedBody;

                this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener( 'mousemove', this._closures['mousemove'], false );
                this._worldController.getDebugDraw().GetSprite().canvas.addEventListener( 'mousemove', this._closures['mousemove'], false );
            } else {
//                this.onShouldCreate();
            }
        },

        /**
         * @param {MouseEvent} e
         */
        onDraggingPiece: function(e) {
            if( !this._currentBody ) return;
            this.updateMousePosition(e);

            var pos = new Box2D.Common.Math.b2Vec2(this._mousePosition.x, this._mousePosition.y);
            pos.Multiply( 1.0 / this._worldController.getDebugDraw().GetDrawScale() );

            this._currentBody.SetPosition(pos);
            this.populateInfoWithB2Body( this._currentBody );
        },

        /**
         * Window 'mouseup' callback
         * @param {MouseEvent} e
         */
        onMouseUp: function(e) {
            this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener( 'mousemove', this._closures['mousemove'], false );
//            this.updateMousePosition(e);
        },



        /**
         * @param {KeyboardEvent} e
         */
        onKeyDown: function(e) {
            var that = this;

            if(e.keyCode == 32) {
                if(this._closures['pan']) // already panning
                    return;

                this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener( 'mousemove', this._closures['pan'], false );
                this._worldController.getDebugDraw().GetSprite().canvas.style.cursor = "move";

                var initialMousePosition = null;
                var initialOffsetPosition = new Box2D.Common.Math.b2Vec2( this._worldController.getDebugDraw().offsetX, this._worldController.getDebugDraw().offsetY );
                this._closures['pan'] = function(e) {
                    that.updateMousePosition(e);

                    if(!initialMousePosition) { // First call
                        initialMousePosition = new Box2D.Common.Math.b2Vec2( that._mousePosition.x, that._mousePosition.y );
                    }

                    var scale = (that._worldController.getDebugDraw().GetDrawScale() * 1.5);
                    that._worldController.getDebugDraw().offsetX = initialOffsetPosition.x + (initialMousePosition.x - that._mousePosition.x) / scale;
                    that._worldController.getDebugDraw().offsetY = initialOffsetPosition.y + (initialMousePosition.y - that._mousePosition.y) / -scale;
                };

                this._worldController.getDebugDraw().GetSprite().canvas.addEventListener( 'mousemove', this._closures['pan'], false );
            }
        },

        /**
         * @param {KeyboardEvent} e
         */
        onKeyUp: function(e) {
            if(e.keyCode == 32) {
                this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener( 'mousemove', this._closures['pan'], false );
                this._worldController.getDebugDraw().GetSprite().canvas.style.cursor = "default";
                this._closures['pan'] = null;
            }
        },


        onControllerWasChanged: function( newValue ) {
            if(this._currentBody == null) return;


            // Create a new using current body's data
            var newBody = this._worldController.createRect(
                this._controllers['x'].getValue() * PTM_RATIO,
                this._controllers['y'].getValue()  * PTM_RATIO,
                this._currentBody.GetAngle(),
                this._controllers['width'].getValue() * PTM_RATIO,
                this._controllers['height'].getValue() * PTM_RATIO,
                this._currentBody.GetType() == Box2D.Dynamics.b2Body.b2_staticBody
            );


            // Destroy the old body, and store the current body inside the previous one's entity
            // NOTE: Assumes GetUserData is of type ChuClone.GameEntity
            var entity = this._currentBody.GetUserData();

            this._worldController.getWorld().DestroyBody( this._currentBody );
            entity.setBody( newBody );
            entity.setDimensions( this._controllers['width'].getValue() * PTM_RATIO, this._controllers['height'].getValue() * PTM_RATIO, this._controllers['depth'].getValue() );

            this._currentBody = newBody;
        },

        /**
         * Populates the GUI.DAT panel with information about this Box2D Body
         * @param aBody
         */
        populateInfoWithB2Body: function( aBody ) {
            this._controllers['x'].setValue( aBody.GetPosition().x );
            this._controllers['y'].setValue( aBody.GetPosition().y );
            this._controllers['width'].setValue( this._currentBody.GetUserData().getDimensions().width / PTM_RATIO );
            this._controllers['height'].setValue( this._currentBody.GetUserData().getDimensions().height / PTM_RATIO );
            this._controllers['depth'].setValue( this._currentBody.GetUserData().getDimensions().depth );
            this._controllers['jumpPad'].setValue( this._currentBody.GetUserData().getComponentWithName( ChuClone.components.JumpPadComponent.prototype.displayName) )
        },


        /**
         * Clones a box2d body
         */
        cloneBody: function() {
            // Create a new using current body's data
            var newBody = this._worldController.createRect(
                this._currentBody.GetPosition.x * PTM_RATIO,
                this._currentBody.GetPosition.y * PTM_RATIO,
                this._currentBody.GetAngle(),
                this._currentBody.GetUserData().getDimensions().width / PTM_RATIO,
                this._currentBody.GetUserData().getDimensions().height / PTM_RATIO,
                this._currentBody.GetType() == Box2D.Dynamics.b2Body.b2_dynamicBody
            );
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
            // Offset for canvas
            this._mousePosition.x = x - this._worldController.getDebugDraw().GetSprite().canvas.offsetLeft;// - (this._worldController.getDebugDraw().offsetX/this._worldController.getDebugDraw().GetDrawScale());
            this._mousePosition.y = y - this._worldController.getDebugDraw().GetSprite().canvas.offsetTop;

            // Offset for DEBUGDRAW
            this._mousePosition.x -= this._worldController.getDebugDraw().offsetX*this._worldController.getDebugDraw().GetDrawScale();
            this._mousePosition.y -= this._worldController.getDebugDraw().offsetY*this._worldController.getDebugDraw().GetDrawScale();
        },

        /**
         * Returns the body at a point, point should be scaled relative position already (@see Box2D.Dynamics.b2DebugDraw.GetDrawScale())
         * // TODO: IMPLEMENT FILTERING?
         * @param {Box2D.Common.Math.b2Vec2} pos
         * @return {Box2D.Dynamics.b2Body}
         */
        getBodyAtPosition: function(pos) {
            var size = 0.1;
            var aabb = new Box2D.Collision.b2AABB();
            aabb.lowerBound.Set( pos.x - size, pos.y - size );
            aabb.upperBound.Set( pos.x + size, pos.y + size );


            var that = this;
            var selectedBody = null;
            that._worldController.getWorld().QueryAABB(function getBodyCB(fixture) {
                // Only level objects
                if(fixture.GetBody().GetUserData() instanceof ChuClone.GameEntity) {
                    selectedBody = fixture.GetBody();
                    return true;
                }
                return false;
            }, aabb);

            if( selectedBody ) {
                this._currentBody = selectedBody;
                this.populateInfoWithB2Body( selectedBody );
            }

            return selectedBody
        },

        /**
         * Adds a controller to DAT.GUI and adds it into our _controllers object.
         * This function also sets a timeout that will be destroyed if the value is changed while waiting to be fired
         * @param {DAT.GUI} aGui
         * @param {String} propName
         * @param {String|Number|Boolean} initialValue
         * @return {DAT.GUI.Controller}
         */
        addControllerWithTimeout: function(aGui, propName, initialValue) {
            var that = this;
            this._propProxy[propName] = initialValue;

            var controller = aGui.add(this._propProxy, propName);
            this._controllers[propName] = controller;

            // Set a timeout that will be destroyed if the value is changed while waiting to be fired
            controller.onFinishChange( function(newValue) {
                clearTimeout( WAIT_TIMEOUT );
                WAIT_TIMEOUT = setTimeout( function() {
                    that.onControllerWasChanged(newValue);
                }, 400);
            });

            return controller;
        },

        removeController: function( propName ) {
            // TODO: Not Implemented
        },


        dealloc: function() {
            this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener( 'mousedown', this._closures['mousedown'], false );
            this._worldController.getDebugDraw().GetSprite().canvas.removeEventListener('mousemove', this._closures['mousemove'], false );
            window.removeEventListener('mouseup', this._closures['mouseup'], false );

            document.removeEventListener('keydown', this._closures['keydown'], false);
            document.removeEventListener('keyup', this._closures['keyup'], false);

            this._closures = null;

            this._worldController = null;
            this._gameView = null;
            this._currentBody = null;
            this._mousePosition = null;
            this._worldController = null;
        }
}
})();