module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        name: '<%= pkg.name %>.<%= pkg.version %>',
        jshint: {
            files: ['gruntfile.js', 'src/js/**/*.js', 'test/**/*.js'],
            options: {
                reporterOutput: "",
                jshintrc: true,
                ignores: ['src/js/Chart/flotlib/jquery.flot.navigate.js']
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        },
        concat: {
            options: {
                separator: "\n"
            },
            n52swcChart: {
                src: [
                    "src/js/Chart/*/*Mdul.js",
                    "src/js/Chart/*/*Ctrl.js",
                    "src/js/Chart/*/*Serv.js",
                    "src/js/Chart/*/*Drtv.js",
                    "src/js/Chart/flotlib/*.js"
                ],
                dest: 'dist/n52swcChart.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('test', ['jshint', 'watch']);
    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('concatModules', ['concat']);
};
