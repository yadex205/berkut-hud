const packager    = require('electron-packager')
const runSequence = require('run-sequence')

gulp.task('release', done => {
  runSequence('build', 'release:package', done)
})

gulp.task('release:package', done => {
  packager({
    // common
    dir: '.',
    arch: 'x64',
    asar: true,
    icon: 'resources/berkut.icns',
    ignore: [/\.nvmrc/, /gulpfile\.js/, /bower.*/, /src/, /.+\.md/, /LICENSE/ ],
    name: 'BERKUT HUD',
    out: 'dist',
    overwrite: true,
    platform: 'darwin',

    // macOS
    appBundleId: 'info.yadex205.berkut.hud',
    appCategoryType: 'public.app-category.productivity',
    osxSign: true,
  }, () => done())
})
