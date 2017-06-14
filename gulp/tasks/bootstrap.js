const runSequence = require('run-sequence')
const spawn       = require('child_process').spawn

const vendorRoot = Node.root.join('vendor')
const ffmpegRoot = vendorRoot.join('ffmpeg')

const FFMPEG_CONFIGURE_OPTIONS = [
  `--prefix="${Node.root.toString()}`,
  '--disable-ffplay', '--disable-ffserver', '--disable-doc', '--disable-encoders'
]

gulp.task('bootstrap', done => {
  runSequence(gulp.childTasksOf('bootstrap'), done)
})

gulp.task('bootstrap:vendor', done => {
  runSequence(gulp.childTasksOf('bootstrap:vendor'), done)
})

gulp.task('bootstrap:vendor:ffmpeg', done => {
  runSequence(...gulp.childTasksOf('bootstrap:vendor:ffmpeg'), done)
})

gulp.task('bootstrap:vendor:ffmpeg:00-configure', done => {
  let file = ffmpegRoot.join('configure').toString()
  let options = { cwd: ffmpegRoot.toString(), stdio: 'inherit', env: process.env }
  spawn(file, FFMPEG_CONFIGURE_OPTIONS, options).on('exit', done)
})

gulp.task('bootstrap:vendor:ffmpeg:10-make', done => {
  let options = { env: process.env, stdio: 'inherit', cwd: ffmpegRoot.toString() }
  spawn('make', ['-j4'], options).on('exit', done)
})

gulp.task('bootstrap:vendor:ffmpeg:20-copy-binary', () => {
  return gulp.src(ffmpegRoot.join('{ffmpeg,ffprobe}').toString())
    .pipe(gulp.dest('bin'))
})
