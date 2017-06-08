const gulp        = require('gulp')
const plug        = require('gulp-load-plugins')()
const browserSync = require('browser-sync').create()
const Electron    = require('electron')
const packager    = require('electron-packager')
const Pathname    = require('node-pathname')
const rimraf      = require('rimraf')
const runSequence = require('run-sequence')
const spawn       = require('child_process').spawn

const SOURCE_ROOT       = new Pathname('src')
const EJS_SOURCES       = SOURCE_ROOT.join('ejs/**/*.ejs')
const SCSS_SOURCES      = SOURCE_ROOT.join('scss/**/*.scss')
const JS_MAIN_SOURCES   = 'lib/**/*.js'
const JS_RENDER_SOURCES = SOURCE_ROOT.join('js/**/*.js')
const BOWER_ROOT        = new Pathname('bower_components')

const DEST_ROOT      = new Pathname('htdocs')
const EJS_DEST       = DEST_ROOT
const SCSS_DEST      = DEST_ROOT.join('css')
const JS_RENDER_DEST = DEST_ROOT.join('js')
const VENDOR_DEST    = DEST_ROOT.join('vendor')

let electronProcess = null

gulp.task('clean', (done) => {
  rimraf('htdocs', done)
})

gulp.task('build', (done) => runSequence('clean', 'build:render', done))

gulp.task('build:render', (done) => {
  runSequence([
    'build:render:ejs', 'build:render:scss', 'build:render:js', 'build:render:bower'
  ], done)
})

gulp.task('build:render:ejs', () => {
  return gulp.src(EJS_SOURCES.toString())
    .pipe(plug.filter(['**/*.ejs', '!**/_*.ejs']))
    .pipe(plug.plumber())
    .pipe(plug.ejs({}, {}, { ext: '.html' }))
    .pipe(gulp.dest(EJS_DEST.toString()))
    .pipe(browserSync.stream())
})

gulp.task('build:render:scss', () => {
  return gulp.src(SCSS_SOURCES.toString())
    .pipe(plug.plumber())
    .pipe(plug.sass().on('error', plug.sass.logError))
    .pipe(gulp.dest(SCSS_DEST.toString()))
    .pipe(browserSync.stream())
})

gulp.task('build:render:js', () => {
  return gulp.src(JS_RENDER_SOURCES.toString())
    .pipe(plug.plumber())
    .pipe(plug.if(NODE_ENV !== 'production', plug.sourcemaps.init()))
    // .pipe(plug.uglify())
    .pipe(plug.concat('app.js'))
    .pipe(plug.if(NODE_ENV !== 'production', plug.sourcemaps.write()))
    .pipe(gulp.dest(JS_RENDER_DEST.toString()))
    .pipe(browserSync.stream())
})

gulp.task('build:render:bower', (done) => {
  runSequence(['build:render:bower:fontawesome',
               'build:render:bower:vue'],
              done)
})

gulp.task('build:render:bower:fontawesome', () => {
  return gulp.src(BOWER_ROOT.join('font-awesome/{css,fonts}/**/*').toString())
    .pipe(plug.filter(['**/*.woff2', '**/*.min.css']))
    .pipe(gulp.dest(VENDOR_DEST.join('font-awesome').toString()))
})

gulp.task('build:render:bower:vue', () => {
  return gulp.src(BOWER_ROOT.join('vue/dist/vue.js').toString())
    .pipe(gulp.dest(VENDOR_DEST.join('vue').toString()))
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
  electronProcess = spawn(
    Electron,
    ['.', '--interactive'],
    { stdio: [0, 1, 2], env: { LIVE_DEVELOPMENT: 'true' } }
  )
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
  runSequence('live:electron:stop', 'live:electron:start', done)
})

gulp.task('release', (done) => {
  packager({
    // common
    dir: '.',
    arch: 'x64',
    asar: true,
    ignore: [/\.nvmrc/, /gulpfile\.js/, /bower.*/, /src/, /.+\.md/, /LICENSE/ ],
    name: 'BERKUT HUD',
    out: 'dist',
    overwrite: true,
    platform: 'darwin',

    // macOS
    appBundleId: 'info.yadex205.berkut.hud',
    appCategoryType: 'public.app-category.productivity',
    osxSign: true,
  }, (_error, _appPaths) => done())
})
