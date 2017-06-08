const EventEmitter = require('events')
const spawn        = require('child_process').spawn

function Searcher(queryString) {
  this.__queryString = queryString
  this.__eventEmitter = new EventEmitter()
}

Searcher.prototype = {
  execute() {
    let mdfind = spawn('sh', ['-c', `mdfind -0 "${this.__mdfindQuery()}"`])
    let leftChunk = ''
    mdfind.stdout.on('data', chunk => {
      let components = (leftChunk + chunk.toString().normalize()).split(/\0/g)
      leftChunk = components.pop()
      components.forEach(filepath => this.__eventEmitter.emit('file', filepath))
    })
    mdfind.on('exit', () => this.__eventEmitter.emit('finish'))
    this.__eventEmitter.on('stop', () => mdfind.kill())
    return this.__eventEmitter
  },

  __mdfindQuery() {
    let queries = this.__queryString.trim().split(/\s/g)
    queries = queries.concat(queries.map(query => `-content:${query}`))
    queries.push('-kind:folder')
    return queries.join(' ')
  }
}

module.exports = Searcher
