document.addEventListener('DOMContentLoaded', () => {
  new Vue({
    el: '#searchresult',
    data: {
      queryString: '',
      results: [],
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
        if (length >= 1) { this.ipc.send('search:cancel') }
      },
    },
    created: function() {
      this.ipc.on('search:result', (_event, queryString, filepaths) => {
        if (this.queryString !== queryString) {
          this.results = filepaths
        } else {
          this.results.push.apply(filepaths)
        }
        this.queryString = queryString
      })
      this.ipc.on('search:finish', (_event, queryString) => {
        if (this.queryString !== queryString) { this.results = [] }
      })
    }
  })
})
