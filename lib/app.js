/* global Node */

const { app, BrowserWindow, ipcMain } = require('electron')
const url                             = require('url')
const Searcher                        = require('./searcher')
const File                            = require('./file')

const APP_URL = process.env.LIVE_DEVELOPMENT === 'true' ?
      'http://localhost:3000' :
      url.format({ pathname: Node.root.join('htdocs/index.html').toString(),
                   protocol: 'file:',
                   slashes: true })

function BerkutHud() {
  this.__window = null
  this._init()
}

BerkutHud.prototype = {
  _init: function() {
    this.__window = new BrowserWindow({ width: 400, height: 640,
                                        'web-preferences': { 'enable-drag-out': true } })
    this.__window.loadURL(APP_URL)
    this.__window.on('closed', () => this.__window = null)

    ipcMain.on('search:request', this._onSearchRequested)
    ipcMain.on('search:cancel', this._onSearchCancelRequested)
  },

  _onSearchRequested: function(event, queryString) {
    this.__searcher = new Searcher(queryString).execute()
      .on('file', filepath => event.sender.send('search:result', queryString, filepath))
      .on('finish', () => event.sender.send('search:finish', queryString))
  },

  _onSearchCancelRequested: function() {
    this.__searcher && this.__searcher.emit('stop')
  }
}

app.on('ready', () => new BerkutHud())
app.on('window-all-closed', app.quit)
