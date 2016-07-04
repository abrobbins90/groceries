/*
Run this file by typing 'gulp' in the command line (you must be somewhere in groceries directory).
More info: https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md
syncronous running: http://stackoverflow.com/questions/26715230/gulp-callback-how-to-tell-gulp-to-run-a-task-first-before-another/26715351
*/
/////////////////// IMPORTS ///////////////////
const gulp = require('gulp')

const babel = require('gulp-babel') // depends on: babel-preset-es2015
const autoprefixer = require('gulp-autoprefixer')


/////////////////// GLOBALS ///////////////////
// for JS, notice that only TOP LEVEL js files are transpiled.  So js files in any subdirectory are NOT transpiled currently.
const src_js = 'www/**/*.js'
const src_js_6 = 'www/*.js'
const src_js_5 = 'www/lib/*.js'
const src_css = 'www/**/*.css'
const src_html = 'www/**/*.html'

const dest = 'www-built'
const dest_js_5 = 'www-built/lib'

const log_standard = function(event) {
	console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
}


///////////////////// MAIN /////////////////////
gulp.task('js', function() {
	gulp.src(src_js_6)
		.pipe(babel({
			presets: ['es2015'], // Specifies which ECMAScript standard to follow.  This is necessary.
		}))
		.pipe(gulp.dest(dest))
	gulp.src(src_js_5)
		.pipe(gulp.dest(dest_js_5))
})
gulp.task('watch.js', function() {
	var watch_js = gulp.watch(src_js, ['js'])
	watch_js.on('change', log_standard)
})

gulp.task('css', function() {
	gulp.src(src_css)
		.pipe(autoprefixer({
			browsers: ['last 3 versions'],
			cascade: false,
		}))
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

