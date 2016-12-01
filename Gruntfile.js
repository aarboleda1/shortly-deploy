module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: ['public/dist/*']
      // release: ['path/to/another/dir/one', 'path/to/another/dir/two']
    },

    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['public/client/*.js'], // Do we need to include the public/lib files here?
        dest: 'public/dist/index.min.js',
      },
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      target: {
        files: {
          'public/dist/index.min.js': ['public/dist/index.min.js']
        }
      }
    },

    eslint: {
      target: [
        '**/*.js',
        '!public/lib/*.js',
        '!node_modules/**'
      ]
    },

    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {'public/dist/style.min.css': ['public/style.css']}
      }
    },


    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      target: {
        command: 'git push live master'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    grunt.task.run([ 'nodemon', 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);


  grunt.registerTask('build', [
    'test',
    'clean',
    'eslint',
    'concat',
    'uglify',
    'cssmin'
  ]);

  grunt.registerTask('deploy', function(n) {
    if (grunt.option('prod')) {
      grunt.task.run([ 'build' ]);
      grunt.task.run([ 'shell' ]);
    } else {
      grunt.task.run([ 'test' ]);
      grunt.task.run([ 'clean' ]);
      grunt.task.run([ 'eslint' ]);
      grunt.task.run([ 'server-dev' ]);
    }
  });

};
