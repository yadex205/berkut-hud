const Pathname = require('node-pathname')
const Loki     = require('lokijs')

global.Node = {
  root: new Pathname(__dirname),
  env:  process.env.NODE_ENV,
  db:   new Loki(),
}

require('./lib/app')
