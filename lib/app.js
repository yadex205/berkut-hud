const { app, BrowserWindow } = require('electron')
const Pathname               = require('node-pathname')
const url                    = require('url')

function App() {
  this.__window = null
}

App.root = new Pathname(app.getAppPath())

App.prototype = {
  createWindow: function() {
    this.__window = new BrowserWindow({})
    this.__window.loadURL(url.format({
      pathname: App.root.join('htdocs/index.html').toString(),
      protocol: 'file:',
      slashes: true,
    }))
    this.__window.on('closed', () => this.__window = null)
  },
}

app.on('ready', () => {
  global.app = new App()
  global.app.createWindow()
})

app.on('window-all-closed', app.quit)
