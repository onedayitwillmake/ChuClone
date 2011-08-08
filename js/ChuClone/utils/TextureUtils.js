(function(){
    ChuClone.namespace("ChuClone.utils");

    /**
     * Textures already loaded
     */
    var loadedTextures = {};

    ChuClone.utils.TextureUtils = {

        /**
         * Returns a texture or loads it if none exist
         * @param {String} textureSource
         */
        GET_TEXTURE: function( textureSource) {
            if( loadedTextures[textureSource] ) {
                return loadedTextures[textureSource];
            }

            loadedTextures[textureSource] = THREE.ImageUtils.loadTexture( textureSource );
            return loadedTextures[textureSource];
        }
    }
})();