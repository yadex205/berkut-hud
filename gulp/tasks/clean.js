const rimraf = require('rimraf')

gulp.task('clean', done => rimraf('htdocs', done))
