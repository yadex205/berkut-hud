window.Searcher = require('electron').remote.require('../lib/searcher')

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('focus', () => {
    document.querySelector('#searchbar-input').focus()
  })
})
