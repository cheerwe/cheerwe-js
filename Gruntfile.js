module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			dist: {
				src: [
					'js/core.js',
					'js/ajax.js',
					'js/component.js',
					'js/mask.js',
					'js/form.js',
					'js/message.js',
					'js/number-editor.js',
					'js/date-picker.js',
					'js/pagebar.js',
					'js/select.js',
					'js/tabs.js',
					'js/grid.js',
					'js/dialog.js',
					'js/auto-complete.js'
				],
				dest: 'we.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist: {
				files: {
					'we.min.js': ['<%= concat.dist.dest %>']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['concat']);
	grunt.registerTask('min', ['concat', 'uglify']);
};