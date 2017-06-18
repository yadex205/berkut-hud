const ChildProcess = require('child_process')
const EventEmitter = require('events')

class MDFind extends EventEmitter {
  constructor(condition = null) {
    super()
    this.__query = condition
  }

  and(condition) {
    if (this.__query) {
      this.__query += `&&${condition}`
    } else {
      this.__query = condition
    }

    return this
  }

  execute() {
    let process = ChildProcess.spawn('sh', ['-c', `mdfind -0 '${this.__query}'`])
    let leftChunk = ''
    process.stdout.on('data', chunk => {
      let filepaths = (leftChunk + chunk.toString().normalize()).split(/\0/g)
      leftChunk = filepaths.pop()
      this.emit('files', filepaths)
    })
    process.on('exit', () => this.emit('finish'))
    this.on('stop', () => process.kill())

    return this
  }
}

module.exports = function(condition) {
  return new MDFind(condition)
}
