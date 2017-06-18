const async  = require('async')
const exec   = require('child_process').exec

const getMetadataXML = async.queue((filepath, callback) => {
  exec(`mdls -plist - ${filepath}`, (error, stdout) => {
    let result = stdout.toString().normalize()
    if (result.startsWith('<?xml')) {
      callback(error, stdout.toString().normalize())
    } else {
      callback(error, '')
    }
  })
}, 4)

function MetadataParser(xml) {
  this.__tagStack = []
  this.__currentKey = ''
  this.metadata = {}
  this.parse(xml)
}

MetadataParser.prototype = {
  parse: function(xml) {
    let parser = require('sax').parser(true)
    parser.onopentag = this.onopentag.bind(this)
    parser.onclosetag = this.onclosetag.bind(this)
    parser.ontext = this.ontext.bind(this)
    parser.write(xml).close()
  },
  onopentag: function({name}) {
    this.__tagStack.push(name)
    if (name === 'array') {
      this.metadata[this.__currentKey] = []
    }
  },
  onclosetag: function() {
    this.__tagStack.pop()
  },
  ontext: function(text) {
    switch (this.currentTag()) {
    case 'key': this.__currentKey = text; break
    default: this.onAttributeValue(text)
    }
  },
  onAttributeValue: function(value) {
    switch (this.currentTag()) {
    case 'integer': value = parseInt(value); break
    case 'real': value = parseFloat(value); break
    case 'date': value = Date.parse(value); break
    case 'string': break
    default: return
    }

    if (this.isArrayItem()) {
      this.metadata[this.__currentKey].push(value)
    } else {
      this.metadata[this.__currentKey] = value
    }
  },
  currentTag: function() {
    return this.__tagStack[this.__tagStack.length - 1]
  },
  isArrayItem: function() {
    return this.__tagStack[this.__tagStack.length - 2] === 'array'
  }
}

module.exports = function(filepath, callback) {
  getMetadataXML.push(filepath, (error, xml) => {
    callback(new MetadataParser(xml).metadata)
  })
}
