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
          icon: window.App.root.join('resources/berkut.iconset/icon_32x32.png').toString()
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
