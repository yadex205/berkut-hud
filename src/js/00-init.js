window.remote = require('electron').remote
window.Pathname = require('electron').remote.require('node-pathname')
window.App = {
  root: new Pathname(window.remote.app.getAppPath())
}

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('focus', () => {
    document.querySelector('#searchbar-input').focus()
  })
})
