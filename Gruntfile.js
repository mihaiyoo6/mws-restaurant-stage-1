module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['dist'],
    uglify: {
      dist: {
        files: {
          'dist/main.min.js': 'js/main.js',
          'dist/dbhelper.min.js': 'js/dbhelper.js',
          'dist/restaurant_info.min.js': 'js/restaurant_info.js',
          'dist/idb.min.js': 'js/idb.js',
        }
      },
      options: {
        banner:  '/*! <%= pkg.name %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
        report: 'gzip',
        sourceMap: true
      }
    },
    cssmin: {
      options: {
        mergeIntoShorthands: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'dist/styles.min.css': ['css/styles.css']
        }
      }
    },
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
            suffix: '_2x',
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
    watch: {
      css: {
        files: ['css/*.css'],
        tasks: ['cssmin']
      },
      js: {
        files: ['js/*.js'],
        tasks: ['uglify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('images', ['responsive_images'])
  grunt.registerTask('default', ['clean','uglify', 'cssmin']);
  // grunt.registerTask('watch', ['watch:scripts']);

};
