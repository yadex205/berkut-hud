const { app, BrowserWindow } = require('electron')
const url                    = require('url')

function App() {
  this.__window = null
}

App.root = Node.root

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
  },

  __appURL: function() {
    if (process.env.LIVE_DEVELOPMENT === 'true') {
            return 'http://localhost:3000'
    } else {
      return url.format({
        pathname: App.root.join('htdocs/index.html').toString(),
        protocol: 'file:',
        slashes: true,
      })
    }
  }
}

app.on('ready', () => {
  global.app = new App()
  global.app.createWindow()
})

app.on('window-all-closed', app.quit)
