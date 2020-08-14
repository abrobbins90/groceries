/*
Run this file by typing 'gulp' in the command line (you must be somewhere in groceries directory).
More info: https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md
syncronous running: http://stackoverflow.com/questions/26715230/gulp-callback-how-to-tell-gulp-to-run-a-task-first-before-another/26715351
*/
/////////////////// IMPORTS ///////////////////
const gulp = require('gulp')

const babel = require('gulp-babel') // depends on: babel-preset-es2015
const autoprefixer = require('gulp-autoprefixer')
const exec = require('child_process').exec
const moment = require('moment')
const prop_reader = require('properties-reader')


/////////////////// GLOBALS ///////////////////
// for JS, notice that only TOP LEVEL js files are transpiled.  So js files in any subdirectory are NOT transpiled currently.
const src_js = 'client-side/**/*.js'
const src_js_6 = 'client-side/*.js'
const src_js_5 = 'client-side/lib/*.js'
const src_css = 'client-side/**/*.css'
const src_html = 'client-side/**/*.html'
const src_static = 'client-side/static/**/*'

const dest = 'client-side-built'
const dest_js_5 = 'client-side-built/lib'
const dest_static = 'client-side-built/static'

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
			cascade: false,
		}))
		.pipe(gulp.dest('client-side-built'))
})
gulp.task('watch.css', function() {
	var watch_css = gulp.watch(src_css, ['css'])
	watch_css.on('change', log_standard)
})

gulp.task('html', function() {
	gulp.src(src_html)
		.pipe(gulp.dest('client-side-built'))
})
gulp.task('watch.html', function() {
	var watch_html = gulp.watch(src_html, ['html'])
	watch_html.on('change', log_standard)
})

gulp.task('static', function() {
	gulp.src(src_static)
		.pipe(gulp.dest(dest_static))
})
gulp.task('watch.static', function() {
	var watch_static = gulp.watch(src_static, ['static'])
	watch_static.on('change', log_standard)
})

gulp.task('dump', function(cb) {
	// Dump a backup of the current database contents into the mongo-dumps folder.
	var props = prop_reader('local-config.ini')
	var location = props.get('computer_name')
	var date = moment().format()
	var command = 'DUMPDIR="mongo-dumps/'+location+'.'+date+'" && mkdir "$DUMPDIR" && mongodump --db groceries --out "$DUMPDIR"'
	exec(command, function (err, stdout, stderr) {
		console.log(stdout)
		console.log(stderr)
		cb(err)
	})
})


gulp.task('watch', ['watch.js', 'watch.css', 'watch.html', 'watch.static'])

gulp.task('default', ['js', 'css', 'html', 'static', 'watch'])

