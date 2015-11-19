module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        name: '<%= pkg.name %>.<%= pkg.version %>',
        services_files: [
            'src/js/services/*.js'
        ],
        diagram_files: [
            'src/js/Diagram/*.js'
        ],
        favorite_files: [
            'src/js/Favorite/*.js'
        ],
        legend_files: [
            'src/js/Legend/*.js'
        ],
        loading_files: [
            'src/js/Loading/*.js'
        ],
        map_files: [
            'src/js/Map/*.js'
        ],
        menu_files: [
            'src/js/Menu/*.js'
        ],
        settings_files: [
            'src/js/Settings/*.js'
        ],
        styling_files: [
            'src/js/Styling/*.js'
        ],
        table_files: [
            'src/js/Table/*.js'
        ],
        time_files: [
            'src/js/Time/*.js'
        ],
        helper_files: [
            'src/js/helper/*.js'
        ],
        ie9_files: [
            'src/js/IE9/*.js'
        ],
        concat: {
            services: {
                src: '<%= services_files %>',
                dest: 'dist/<%= name %>.services.js'
            },
            diagram: {
                src: '<%= diagram_files %>',
                dest: 'dist/<%= name %>.diagram.js'
            },
            favorite: {
                src: '<%= favorite_files %>',
                dest: 'dist/<%= name %>.favorite.js'
            },
            legend: {
                src: '<%= legend_files %>',
                dest: 'dist/<%= name %>.legend.js'
            },
            loading: {
                src: '<%= loading_files %>',
                dest: 'dist/<%= name %>.loading.js'
            },
            map: {
                src: '<%= map_files %>',
                dest: 'dist/<%= name %>.map.js'
            },
            menu: {
                src: '<%= menu_files %>',
                dest: 'dist/<%= name %>.menu.js'
            },
            settings: {
                src: '<%= settings_files %>',
                dest: 'dist/<%= name %>.settings.js'
            },
            styling: {
                src: '<%= styling_files %>',
                dest: 'dist/<%= name %>.styling.js'
            },
            table: {
                src: '<%= table_files %>',
                dest: 'dist/<%= name %>.table.js'
            },
            time: {
                src: '<%= time_files %>',
                dest: 'dist/<%= name %>.time.js'
            },
            helper: {
                src: '<%= helper_files %>',
                dest: 'dist/<%= name %>.helper.js'
            },
            ie9: {
                src: '<%= ie9_files %>',
                dest: 'dist/IE9/<%= name %>.ie9.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= name %> */\n'
            },
            services: {
                files: {
                    'dist/<%= name %>.services.min.js': ['<%= concat.services.dest %>']
                }
            },
            diagram: {
                files: {
                    'dist/<%= name %>.diagram.min.js': ['<%= concat.diagram.dest %>']
                }
            },
            favorite: {
                files: {
                    'dist/<%= name %>.favorite.min.js': ['<%= concat.favorite.dest %>']
                }
            },
            legend: {
                files: {
                    'dist/<%= name %>.legend.min.js': ['<%= concat.legend.dest %>']
                }
            },
            loading: {
                files: {
                    'dist/<%= name %>.loading.min.js': ['<%= concat.loading.dest %>']
                }
            },
            map: {
                files: {
                    'dist/<%= name %>.map.min.js': ['<%= concat.map.dest %>']
                }
            },
            menu: {
                files: {
                    'dist/<%= name %>.menu.min.js': ['<%= concat.menu.dest %>']
                }
            },
            settings: {
                files: {
                    'dist/<%= name %>.settings.min.js': ['<%= concat.settings.dest %>']
                }
            },
            styling: {
                files: {
                    'dist/<%= name %>.styling.min.js': ['<%= concat.styling.dest %>']
                }
            },
            table: {
                files: {
                    'dist/<%= name %>.table.min.js': ['<%= concat.table.dest %>']
                }
            },
            time: {
                files: {
                    'dist/<%= name %>.time.min.js': ['<%= concat.time.dest %>']
                }
            },
            helper: {
                files: {
                    'dist/<%= name %>.helper.min.js': ['<%= concat.helper.dest %>']
                }
            },
            ie9: {
                files: {
                    'dist/IE9/<%= name %>.ie9.min.js': ['<%= concat.ie9.dest %>']
                }
            }
        },
        jshint: {
            files: ['gruntfile.js', 'src/js/**/*.js', 'test/**/*.js'],
            options: {
                // more options here if you want to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true
                },
                ignores: ['src/js/flotlib/jquery.flot.navigate.js']
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('test', ['jshint', 'watch']);

    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};