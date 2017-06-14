const Electron    = require('electron')
const runSequence = require('run-sequence')
const spawn       = require('child_process').spawn

let electronProcess = null

gulp.task('live', done => {
  runSequence('build', ['live:browse-sync', 'live:watch'], 'live:electron:start', done)
})

gulp.task('live:browse-sync', done => {
  browserSync.init({
    ui: false,
    open: false,
    server: { baseDir: Node.root.join('htdocs').toString() },
  })
  done()
})

gulp.task('live:watch', done => {
  gulp.watch(Node.root.join('src/ejs/**/*.ejs').toString(), ['build:render:ejs'])
  gulp.watch(Node.root.join('src/scss/**/*.scss').toString(), ['build:render:scss'])
  gulp.watch(Node.root.join('src/js/**/*.js').toString(), ['build:render:js'])
  gulp.watch(Node.root.join('lib/**/*.js').toString(), ['live:electron:restart'])
  done()
})

gulp.task('live:electron:start', done => {
  electronProcess = spawn(
    Electron,
    ['.', '--interactive'],
    { stdio: [0, 1, 2], env: { LIVE_DEVELOPMENT: 'true' } }
  )
  process.on('exit', () => electronProcess.kill())
  done()
})

gulp.task('live:electron:stop', done => {
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

gulp.task('live:electron:restart', done => {
  runSequence('live:electron:stop', 'live:electron:start', done)
})
