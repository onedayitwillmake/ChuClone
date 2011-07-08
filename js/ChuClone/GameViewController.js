/**
 File:
    GameViewController.js
 Created By:
    mariogonzalez

 Project:

 Abstract:

 Basic Usage:

 }
 */
(function() {
    "use strict";
    ChuClone.namespace("ChuClone");
    ChuClone.GameViewController = function() {

    };

    ChuClone.GameViewController.prototype = {
        /**
         * @type {HTMLDivElement}
         */
        _domElement: null,

        /**
         * @type {THREE.Scene}
         */
        _scene: null,

        /**
         * @type {THREE.Camera}
         */
        _camera: null,

        /**
         * @type {THREE.AmbientLight}
         */
        _ambientLight: null,

        /**
         * @type {Number}
         */
        NEXT_VIEW_UUID  : 0,
    }
})();