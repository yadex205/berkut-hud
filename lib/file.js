/* global Node */

const metadata  = require('./file/metadata')
const Thumbnail = require('./file/thumbnail')

const adapter =
      Node.db.getCollection('files') ||
      Node.db.addCollection('files', {
        indices: ['filepath'],
        unique:  ['filepath'],
        exact:   ['filepath']
      })

class File {
  constructor(doc) {
    this.__doc = doc
  }

  get id() {
    return this.__doc.$loki
  }

  get filepath() {
    return this.__doc.filepath
  }

  get thumbnail() {
    return this.__doc.thumbnail
  }

  get contentTypeTree() {
    return this.__doc.contentTypeTree
  }

  update(properties = {}) {
    Object.entries(properties).forEach(([key, value]) => {
      this.__doc[key] = value
      adapter.update(this.__doc)
    })
  }

  createThumbnail(callback) {
    Thumbnail.request(this.filepath, base64Image => {
      this.update({ thumbnail: base64Image })
      callback(base64Image)
    })
  }

  updateContentTypeTree(callback) {
    metadata(this.filepath, data => {
      this.update({ contentTypeTree: data.kMDItemContentTypeTree  })
      callback(data.kMDItemContentTypeTree)
    })
  }
}

File.insert = function(filepath) {
  return new File(adapter.insert({ filepath: filepath }))
}

File.find_by_filepath = function(filepath) {
  let doc = adapter.findOne({ filepath: filepath })
  if (!doc) { return }
  return new File(doc)
}

module.exports = File
