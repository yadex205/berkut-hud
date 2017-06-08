document.addEventListener('DOMContentLoaded', () => {
  window.searchbar = new Vue({
    el: '#searchbar',
    data: { query: '' },
    watch: {
      query: function(newVal) {
        if (!newVal || !newVal.trim()) { return }
        window.searchresult.search(newVal)
      }
    }
  })
})
