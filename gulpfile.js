const Pathname    = require('node-pathname')
const requireDir  = require('require-dir')

global.Node = {
  env:  process.env.NODE_ENV || 'development',
  root: new Pathname(__dirname),
}

global.gulp = require('gulp')
global.gulp.childTasksOf = function(taskName) {
  let expect = new RegExp('^' + taskName + ':((?!:).)+$')
  return Object.keys(global.gulp.tasks).filter(val => expect.test(val))
}

global.browserSync = require('browser-sync').create()

requireDir('./gulp/tasks', { recursive: true })
