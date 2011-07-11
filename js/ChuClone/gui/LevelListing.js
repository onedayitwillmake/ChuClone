/**
 File:
    BackgroundParticleManager.js
 Created By:
    Mario Gonzalez - mariogonzalez@gmail.com
 Project:
    ChuClone
 Abstract:
    Creates and manages background particles in the game.
    These particles have no effect on gameplay.

 Basic Usage:

  License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";
    ChuClone.namespace("ChuClone.gui");
    ChuClone.view.LevelListing = function() {
        this.setupGeometry();
    },

    ChuClone.view.BackgroundParticleManager.prototype = {

        _amount     : 200,

        /**
         * @type {THREE.Geometry}
         */
        _geometry           : null,
        _particleSystems    : [],

        setupGeometry: function( ) {
            this._geometry = new THREE.Geometry();
            var radius = 1000;
            var halfRadius = radius/2;

            for( var i = 0; i < this._amount; i++) {
                var vector = new THREE.Vector3( 1000, Math.random() * radius - halfRadius, Math.random() * radius - halfRadius );
                this._geometry.vertices.push( new THREE.Vertex( vector ) );
            }

            var parameters = [ [ [1.0, 1.0, 1.0], 5 ], [ [0.95, 1, 1], 4 ], [ [0.90, 1, 1], 3 ], [ [0.85, 1, 1], 2 ], [ [0.80, 1, 1], 1 ] ];
            for( i = 0; i < parameters.length; i++ ) {
                var size = parameters[i][1];
                var color = parameters[i][0];

                var material = new THREE.ParticleBasicMaterial( {size: size*2} );
                material.color.setHSV( color[0], color[1], color[2] );

                var system = new THREE.ParticleSystem( this._geometry, material );
//                system.rotation.x = Math.random() * Math.PI * 2;
//                system.rotation.y = Math.random() * Math.PI * 2;
//                system.rotation.z = Math.random() * Math.PI * 2;

                this._particleSystems.push( system );
            }
        },

        /**
         * Deallocate memory
         */
        dealloc: function() {

        },

        ///// ACCESSORS
        /**
         * @return {Array} An array of {THREE.ParticleSystem}
         */
        getSystems: function() { return this._particleSystems; }
    }

    console.log(ChuClone.view)
})();