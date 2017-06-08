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
    this.__window.loadURL(this.__appURL())
    this.__window.on('closed', () => this.__window = null)
  },

  __appURL: function() {
    if (process.env.NODE_ENV === 'production') {
      return url.format({
        pathname: App.root.join('htdocs/index.html').toString(),
        protocol: 'file:',
        slashes: true,
      })
    } else {
      return 'http://localhost:3000'
    }
  }
}

app.on('ready', () => {
  global.app = new App()
  global.app.createWindow()
})

app.on('window-all-closed', app.quit)
