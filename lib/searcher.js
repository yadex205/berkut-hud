const mdfind = require('./mdfind')
const Query  = require('./searcher/query')

function Searcher(queryString) {
  this.__query = new Query(queryString)
}

Searcher.prototype = {
  execute() {
    return mdfind('kMDItemKind!="*folder*"c')
      .and('(kMDItemContentTypeTree=="public.audiovisual-content"||kMDItemContentTypeTree=="*")')
      .and(this.__query.words().map(word => `kMDItemAlternateNames=="*${word}*"c`).join('&&'))
      .execute()
  }
}

module.exports = Searcher
