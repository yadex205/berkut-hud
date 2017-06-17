const Pathname = require('node-pathname')

global.Node = {
  root: new Pathname(__dirname),
  env:  process.env.NODE_ENV,
}

require('./lib/app')
