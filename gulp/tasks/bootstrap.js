/* global __dirname, gulp, childTasks */

const Pathname    = require('node-pathname')
const runSequence = require('run-sequence')
const spawn       = require('child_process').spawn

let root = new Pathname(process.cwd())
let vendorRoot = root.join('vendor')
let ffmpegRoot = vendorRoot.join('ffmpeg')

gulp.task('bootstrap', done => {
  runSequence(childTasks('bootstrap'), done)
})

gulp.task('bootstrap:vendor', done => {
  runSequence(childTasks('bootstrap:vendor'), done)
})

gulp.task('bootstrap:vendor:ffmpeg', done => {
  runSequence(...childTasks('bootstrap:vendor:ffmpeg'), done)
})

gulp.task('bootstrap:vendor:ffmpeg:00-configure', done => {
  let file = ffmpegRoot.join('configure').toString()
  let args = [`--prefix="${vendorRoot.parent().toString()}"`,
              '--disable-ffplay', '--disable-ffserver', '--disable-doc',
              '--disable-encoders']
  let options = { cwd: ffmpegRoot.toString(), stdio: 'inherit', env: process.env }
  spawn(file, args, options).on('exit', done)
})

gulp.task('bootstrap:vendor:ffmpeg:10-make', done => {
  let options = { env: process.env,
                  stdio: 'inherit',
                  cwd: ffmpegRoot.toString() }
  spawn('make', ['-j4'], options).on('exit', done)
})

gulp.task('bootstrap:vendor:ffmpeg:20-copy-binary', () => {
  return gulp.src(ffmpegRoot.join('{ffmpeg,ffprobe}').toString())
    .pipe(gulp.dest('bin'))
})
