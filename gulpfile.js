/*
Run this file by typing 'gulp' in the command line (you must be somewhere in groceries directory).
More info: https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md
syncronous running: http://stackoverflow.com/questions/26715230/gulp-callback-how-to-tell-gulp-to-run-a-task-first-before-another/26715351
*/
/////////////////// IMPORTS ///////////////////
const gulp = require('gulp')

const babel = require('gulp-babel') // depends on: babel-preset-es2015


/////////////////// GLOBALS ///////////////////
const src_js = 'www/**/*.js'
const src_css = 'www/**/*.css'
const src_html = 'www/**/*.html'

const dest = 'www-built'

const log_standard = function(event) {
	console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
}


///////////////////// MAIN /////////////////////
gulp.task('js', function() {
	gulp.src(src_js)
		.pipe(babel({
			presets: ['es2015'], // Specifies which ECMAScript standard to follow.  This is necessary.
		}))
		.pipe(gulp.dest(dest))
})
gulp.task('watch.js', function() {
	var watch_js = gulp.watch(src_js, ['js'])
	watch_js.on('change', log_standard)
})

gulp.task('css', function() {
	gulp.src(src_css)
		.pipe(gulp.dest('www-built'))
})
gulp.task('watch.css', function() {
	var watch_css = gulp.watch(src_css, ['css'])
	watch_css.on('change', log_standard)
})

gulp.task('html', function() {
	gulp.src(src_html)
		.pipe(gulp.dest('www-built'))
})
gulp.task('watch.html', function() {
	var watch_html = gulp.watch(src_html, ['html'])
	watch_html.on('change', log_standard)
})

gulp.task('watch', ['watch.js', 'watch.css', 'watch.html'])

gulp.task('default', ['js', 'css', 'html', 'watch'])

