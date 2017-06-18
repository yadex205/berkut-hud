/* global Node */

const { app, BrowserWindow, ipcMain } = require('electron')
const async                           = require('async')
const url                             = require('url')
const Searcher                        = require('./searcher')
const File                            = require('./file')

const APP_URL = process.env.LIVE_DEVELOPMENT === 'true' ?
      'http://localhost:3000' :
      url.format({ pathname: Node.root.join('htdocs/index.html').toString(),
                   protocol: 'file:',
                   slashes: true })

const thumbnailService = async.queue((filepath, callback) => {
  let file = File.find_by_filepath(filepath) || File.insert(filepath)
  if (file.thumbnail) {
    callback(null, file.thumbnail)
  } else {
    file.createThumbnail(thumbnail => callback(null, thumbnail))
  }
}, 1)

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
    ipcMain.on('thumbnail:request', this._onThumbnailRequested)
  },

  _onSearchRequested: function(event, queryString) {
    thumbnailService.remove(() => true)
    this.__searcher = new Searcher(queryString).execute()
      .on('files', filepaths => event.sender.send('search:result', queryString, filepaths))
      .on('finish', () => event.sender.send('search:finish', queryString))
  },

  _onSearchCancelRequested: function() {
    this.__searcher && this.__searcher.emit('stop')
  },

  _onThumbnailRequested: function(event, filepath) {
    thumbnailService.push(filepath, (_error, thumbnail) => {
      event.sender.send('thumbnail:result', filepath, thumbnail)
    })
  }
}

app.on('ready', () => new BerkutHud())
app.on('window-all-closed', app.quit)
