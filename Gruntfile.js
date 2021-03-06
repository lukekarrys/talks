var talks = require('./talks.json');

Object.keys(talks).forEach((talk) => {
  var td = talks[talk];
  var title = td.title;
  var location = td.location;
  var links = td.links;

  var data = `extends ../_layout.jade
include ../_talk.jade

block content
  +talk(${JSON.stringify({title, location, links})})
    | ${td.description}

`;
  require('fs').writeFileSync(`_jade/talks/${talk}.jade`, data);
})

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jade');

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');

    var env = process.env.NODE_ENV || 'development';

    grunt.initConfig({
        //- compile main less file to output css file
        less: {
            target: {
                options: {
                    plugins: [
                        new (require('less-plugin-autoprefix'))({browsers: ['last 2 versions']})
                    ]
                },
                files: {
                    'public/css/main.css': ['_less/main.less']
                }
            }
        },

        //- minify everything in the css output folder
        //- just add .min.css to the filename
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'public/css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'public/css',
                    ext: '.min.css'
                }]
            }
        },

        //- compile jade in the jade dir to matching paths in
        //  the output dir
        //- if you want pretty urls, make sure your jade files named index.jade, e.g:
        //
        //    about/index.jade   -> available at about/
        //    contact/index.jade -> available at contact/
        jade: {
            target: {
                options: {
                    data: {
                        env: env,
                        talks: talks
                    }
                },
                files: [{
                      expand: true,
                      cwd: '_jade',
                      src: ['**/*.jade', '!**/_*.jade'],
                      dest: 'public',
                      ext: '.html'
                }]
            }
        },

        //- browserify the main javascript file to the output js dir
        browserify: {
            main: {
                src: '_js/main.js',
                dest: 'public/js/main.js'
            }
        },

        //- minify any js files in the output dir
        uglify: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'public/js',
                    src: ['*.js', '!*.min.js'],
                    dest: 'public/js',
                    ext: '.min.js'
                }]
            }
        },

        //- copy any files in assets to the same place in output dir
        //- beware of clobbering other generated files
        copy: {
            public: {
                files: [{
                    cwd: '_assets',
                    expand: true,
                    src: ['**'],
                    dest: 'public/'
                }]
            }
        },

        watch: {
            build: {
                files: ['_less/**', '_jade/**', '_js/**', '_assets/**'],
                tasks: ['build'],
                options: {
                    livereload: true,
                    atBegin: true
                }
            }
        },

        connect: {
            server: {
                options: {
                    port: 9001,
                    base: 'public',
                    livereload: true,
                    open: true,
                    middleware: function (connect, options) {
                      return [
                        require('connect-livereload')(),
                        require('serve-static')(options.base[0])
                      ]
                    }
                }
            }
        }
    });

    grunt.registerTask('build', ['copy', 'less', 'cssmin', 'jade', 'browserify', 'uglify']);
    grunt.registerTask('serve', ['connect:server', 'watch']);
    grunt.registerTask('default', ['build']);
};
