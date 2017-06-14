/* global gulp */

const gulp = require('gulp')

global.childTasks = function(taskName) {
  let expect = new RegExp('^' + taskName + ':((?!:).)+$')
  return Object.keys(gulp.tasks).filter(val => expect.test(val))
}

global.gulp = gulp
