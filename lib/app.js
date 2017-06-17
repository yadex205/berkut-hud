/* global Node */

const { app, BrowserWindow } = require('electron')
const url                    = require('url')

const APP_URL = process.env.LIVE_DEVELOPMENT === 'true' ?
      'http://localhost:3000' :
      url.format({ pathname: Node.root.join('htdocs/index.html').toString(),
                   protocol: 'file:',
                   slashes: true })

function BerkutHud() {
  this.__window = null
  this._createWindow()
}

BerkutHud.prototype = {
  _createWindow: function() {
    this.__window = new BrowserWindow({ width: 400, height: 640,
                                        'web-preferences': { 'enable-drag-out': true } })
    this.__window.loadURL(APP_URL)
    this.__window.on('closed', () => this.__window = null)
  }
}

app.on('ready', () => new BerkutHud())
app.on('window-all-closed', app.quit)
