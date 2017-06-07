const gulp        = require('gulp')
const plug        = require('gulp-load-plugins')()
const browserSync = require('browser-sync').create()
const Electron    = require('electron')
const Pathname    = require('node-pathname')
const runSequence = require('run-sequence')
const spawn       = require('child_process').spawn

const NODE_ENV = process.env.NODE_ENV

const SOURCE_ROOT       = new Pathname('src')
const EJS_SOURCES       = SOURCE_ROOT.join('ejs/**/*.ejs')
const SCSS_SOURCES      = SOURCE_ROOT.join('scss/**/*.scss')
const JS_MAIN_SOURCES   = SOURCE_ROOT.join('js/main/**/*.js')
const JS_RENDER_SOURCES = SOURCE_ROOT.join('js/render/**/*.js')

const DEST_ROOT      = new Pathname('htdocs')
const EJS_DEST       = DEST_ROOT
const SCSS_DEST      = DEST_ROOT.join('css')
const JS_MAIN_DEST   = 'lib'
const JS_RENDER_DEST = DEST_ROOT.join('js')

let electronProcess = null

gulp.task('build', (done) => runSequence(['build:main', 'build:render'], done))

gulp.task('build:main', () => {
  return gulp.src(JS_MAIN_SOURCES.toString())
    .pipe(plug.plumber())
    .pipe(plug.if(NODE_ENV !== 'production', plug.sourcemaps.init()))
    .pipe(plug.uglify())
    .pipe(plug.if(NODE_ENV !== 'production', plug.sourcemaps.write()))
    .pipe(gulp.dest(JS_MAIN_DEST.toString()))
})

gulp.task('build:render', (done) => {
  runSequence(['build:render:ejs', 'build:render:scss', 'build:render:js'], done)
})

gulp.task('build:render:ejs', () => {
  return gulp.src(EJS_SOURCES.toString())
    .pipe(plug.filter(['**/*.ejs', '!**/_*.ejs']))
    .pipe(plug.plumber())
    .pipe(plug.ejs({}, {}, { ext: '.html' }))
    .pipe(gulp.dest(EJS_DEST.toString()))
})

gulp.task('build:render:scss', () => {
  return gulp.src(SCSS_SOURCES.toString())
    .pipe(plug.plumber())
    .pipe(plug.sass().on('error', plug.sass.logError))
    .pipe(gulp.dest(SCSS_DEST.toString()))
})

gulp.task('build:render:js', () => {
  return gulp.src(JS_RENDER_SOURCES.toString())
    .pipe(plug.plumber())
    .pipe(plug.if(NODE_ENV !== 'production', plug.sourcemaps.init()))
    .pipe(plug.uglify())
    .pipe(plug.concat('app.js'))
    .pipe(plug.if(NODE_ENV !== 'production', plug.sourcemaps.write()))
    .pipe(gulp.dest(JS_RENDER_DEST.toString()))
})

gulp.task('live', (done) => {
  runSequence('build',
              ['live:browse-sync', 'live:watch'],
              'live:electron:start')
})

gulp.task('live:browse-sync', (done) => {
  browserSync.init({
    ui: false,
    open: false,
    server: { baseDir: DEST_ROOT.toString() },
  })
  done()
})

gulp.task('live:watch', (done) => {
  gulp.watch(EJS_SOURCES.toString(), ['build:render:ejs'])
  gulp.watch(SCSS_SOURCES.toString(), ['build:render:scss'])
  gulp.watch(JS_RENDER_SOURCES.toString(), ['build:render:js'])
  gulp.watch(JS_MAIN_SOURCES.toString(), ['live:electron:restart'])
  done()
})

gulp.task('live:electron:start', (done) => {
  electronProcess = spawn(Electron, ['.'], { stdio: ['ignore', 1, 2] })
  process.on('exit', () => electronProcess.kill())
  done()
})

gulp.task('live:electron:stop', (done) => {
  if (electronProcess) {
    electronProcess.on('exit', () => {
      electronProcess = null
      done()
    })
    electronProcess.kill()
  } else {
    done()
  }
})

gulp.task('live:electron:restart', (done) => {
  runSequence('live:electron:start', 'live:electron:stop', done)
})
