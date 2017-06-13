function Query(queryString) {
  this.__queryString = queryString
  this._prepare()
  this._parse()
}

Query.prototype = {
  words: function() {
    return this.__words
  },

  _prepare: function() {
    this.__words = []
  },

  _parse: function() {
    this._components().forEach(val => {
      this.__words.push(val)
    })
  },

  _components: function() {
    return this.__queryString.trim().split(/\s+/g)
  }
}

module.exports = Query
