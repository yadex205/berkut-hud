document.addEventListener('DOMContentLoaded', () => {
  new Vue({
    el: '#searchbar',
    data: {
      query: '',
      ipc: require('electron').ipcRenderer,
      requestTimeoutID: null,
    },
    watch: {
      query: function(newVal, oldVal) {
        [newVal, oldVal] = [newVal, oldVal].map(val => val.trim())
        if (!newVal || newVal === oldVal) { return }

        if (this.requestTimeoutID) { clearTimeout(this.requestTimeoutID) }
        this.requestTimeoutID = setTimeout(() => {
          this.requestTimeoutID = null
          this.ipc.send('search:cancel')
          this.ipc.send('search:request', newVal)
        }, 150)
      }
    }
  })
})
