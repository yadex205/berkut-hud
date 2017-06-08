document.addEventListener('DOMContentLoaded', () => {
  window.searchresult = new Vue({
    el: '#searchresult',
    data: { results: [], searcher: null },
    methods: {
      search: function(query) {
        if (this.searcher) { this.searcher.emit('stop') }
        this.results = []
        this.searcher = new window.Searcher(query).execute()
        this.searcher.on('file', filepath => {
          this.results.push(filepath)
        })
      },
      startdrag: function(filepath) {
        require('electron').remote.getCurrentWebContents().startDrag({
          file: filepath,
          icon: '/Users/canon/Dropbox/DtAqeum_.jpg'
        })
      }

    },
    watch: {
      'results.length': function(length) {
        if (length >= 1 && this.searcher) { this.searcher.emit('stop') }
      },
    },
  })
})
