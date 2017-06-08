const { app, BrowserWindow } = require('electron')
const Pathname               = require('node-pathname')
const url                    = require('url')

function App() {
  this.__window = null
}

App.root = new Pathname(app.getAppPath())

App.prototype = {
  createWindow: function() {
    this.__window = new BrowserWindow({
      width: 400,
      height: 640,
      'web-preferences': {
        'enable-drag-out': true
      }
    })
    this.__window.loadURL(this.__appURL())
    this.__window.on('closed', () => this.__window = null)
    if (!this.__isProduction()) {
      this.__window.webContents.openDevTools()
    }
  },

  __appURL: function() {
    if (this.__isProduction()) {
      return url.format({
        pathname: App.root.join('htdocs/index.html').toString(),
        protocol: 'file:',
        slashes: true,
      })
    } else {
      return 'http://localhost:3000'
    }
  },

  __isProduction: function() {
    return process.env.NODE_ENV === 'production'
  }
}

app.on('ready', () => {
  global.app = new App()
  global.app.createWindow()
})

app.on('window-all-closed', app.quit)
