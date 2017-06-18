/* global Vue */

document.addEventListener('DOMContentLoaded', () => {
  new Vue({
    el: '#searchresult',
    data: {
      queryString: '',
      results: [],
      thumbnails: new Array(100).fill(null),
      ipc: require('electron').ipcRenderer
    },
    methods: {
      startdrag: function(filepath) {
        require('electron').remote.getCurrentWebContents().startDrag({
          file: filepath,
          icon: window.App.root.join('resources/berkut.iconset/icon_32x32.png').toString()
        })
      }
    },
    watch: {
      'results.length': function(length) {
        if (length >= 20) { this.ipc.send('search:cancel') }
      },
    },
    created: function() {
      this.ipc.on('search:result', (_event, queryString, filepaths) => {
        if (this.queryString !== queryString) {
          this.results = []
          this.thumbnails.fill('')
        }
        filepaths.forEach(filepath => {
          this.results.push(filepath)
          this.ipc.send('thumbnail:request', filepath)
        })

        this.queryString = queryString
      })
      this.ipc.on('search:finish', (_event, queryString) => {
        if (this.queryString !== queryString) { this.results.splice(0, this.results.length) }
      })
      this.ipc.on('thumbnail:result', (_event, filepath, base64Image) => {
        Vue.set(this.thumbnails, this.results.indexOf(filepath), base64Image)
      })
    }
  })
})
