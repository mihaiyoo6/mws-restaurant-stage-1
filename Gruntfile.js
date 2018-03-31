module.exports = function (grunt) {

  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [{
            width: 320,
            suffix: '_1x',
            quality: 50
          }, {
            width: 640,
            suffix: '_large_1x',
            quality: 50
          }, {
            width: 1280,
            suffix: '_large_2x',
            quality: 50
          }]
        },
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png}'],
          cwd: 'img_src/',
          dest: 'img/'
        }]
      }
    },
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.registerTask('default', ['responsive_images']);

};
