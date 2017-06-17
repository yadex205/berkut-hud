const Pathname    = require('node-pathname')
const runSequence = require('run-sequence')

const concat     = require('gulp-concat')
const ejs        = require('gulp-ejs')
const filter     = require('gulp-filter')
const gulpIf     = require('gulp-if')
const plumber    = require('gulp-plumber')
const sass       = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')

const SOURCE_ROOT       = new Pathname('src')
const BOWER_ROOT        = new Pathname('bower_components')
const EJS_SOURCES       = SOURCE_ROOT.join('ejs/**/*.ejs')
const SCSS_SOURCES      = SOURCE_ROOT.join('scss/**/*.scss')
const JS_RENDER_SOURCES = SOURCE_ROOT.join('js/**/*.js')

const DEST_ROOT      = new Pathname('htdocs')
const EJS_DEST       = DEST_ROOT
const SCSS_DEST      = DEST_ROOT.join('css')
const JS_RENDER_DEST = DEST_ROOT.join('js')
const VENDOR_DEST    = DEST_ROOT.join('vendor')

gulp.task('build', done => runSequence(...gulp.childTasksOf('build'), done))

gulp.task('build:render', done => runSequence(...gulp.childTasksOf('build:render'), done))

gulp.task('build:render:ejs', () => {
  return gulp.src(EJS_SOURCES.toString())
    .pipe(filter(['**/*.ejs', '!**/_*.ejs']))
    .pipe(plumber())
    .pipe(ejs({}, {}, { ext: '.html' }))
    .pipe(gulp.dest(EJS_DEST.toString()))
    .pipe(browserSync.stream())
})

gulp.task('build:render:scss', () => {
  return gulp.src(SCSS_SOURCES.toString())
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(SCSS_DEST.toString()))
    .pipe(browserSync.stream())
})

gulp.task('build:render:js', () => {
  return gulp.src(JS_RENDER_SOURCES.toString())
    .pipe(plumber())
    .pipe(gulpIf(Node.env !== 'production', sourcemaps.init()))
    .pipe(concat('app.js'))
    .pipe(gulpIf(Node.env !== 'production', sourcemaps.write()))
    .pipe(gulp.dest(JS_RENDER_DEST.toString()))
    .pipe(browserSync.stream())
})

gulp.task('build:render:bower', done => runSequence(...gulp.childTasksOf('build:render:bower'), done))

gulp.task('build:render:bower:fontawesome', () => {
  return gulp.src(BOWER_ROOT.join('font-awesome/{css,fonts}/**/*').toString())
    .pipe(filter(['**/*.woff2', '**/*.min.css']))
    .pipe(gulp.dest(VENDOR_DEST.join('font-awesome').toString()))
})

gulp.task('build:render:bower:vue', () => {
  return gulp.src(BOWER_ROOT.join('vue/dist/vue.js').toString())
    .pipe(gulp.dest(VENDOR_DEST.join('vue').toString()))
})
