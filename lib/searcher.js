const mdfind = require('./mdfind')

function Searcher(queryString) {
  this.__words = []
  this._parseQuery(queryString)
}

Searcher.prototype = {
  execute() {
    return mdfind('kMDItemKind!="*folder*"c')
      .and('(kMDItemContentTypeTree=="public.audiovisual-content"||kMDItemContentTypeTree=="*")')
      .and(this.__words.map(word => `kMDItemAlternateNames=="*${word}*"c`).join('&&'))
      .execute()
  },

  _parseQuery: function(queryString) {
    queryString.trim().split(/\s+/g).forEach(val => {
      this.__words.push(val)
    })
  }
}

module.exports = Searcher
