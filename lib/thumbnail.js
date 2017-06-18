/* global Node */

const async = require('async')
const spawn = require('child_process').spawn

const FFMPEG_BIN  = Node.root.join('bin/ffmpeg')
const FFPROBE_BIN = Node.root.join('bin/ffprobe')

function ffprobe(filepath, callback) {
  let chunks = []
  let proc = spawn(FFPROBE_BIN.toString(),
                   ['-hide_banner', '-print_format', 'json', '-show_format', `${filepath}`],
                   { stdio: ['ignore', 'pipe', 'ignore'] })
  proc.stdout.on('data', chunk => chunks.push(chunk))
  proc.on('exit', () => {
    try {
      callback(JSON.parse(Buffer.concat(chunks).toString()))
    } catch (error) {
      callback({})
    }
  })
}

const getVideoThumbnailWorker = async.queue((filepath, callback) => {
  ffprobe(filepath, info => {
    if (!info || !info.format) {
      callback(null, null)
      return
    }

    let chunks = []
    let args = ['-hide_banner']
    switch (info.format.format_name) {
    case 'image2', 'png_pipe':
      args.push('-i', filepath)
      break
    default :
      args.push('-ss', info.format.duration * 0.25, '-i', filepath, '-vframes', '1')
    }
    args.push('-f', 'image2', '-vf', 'scale=72:-1', 'pipe:1')
    let proc = spawn(FFMPEG_BIN.toString(), args, { stdio: ['ignore', 'pipe', 'ignore'] })
    proc.stdout.on('data', chunk => chunks.push(chunk))
    proc.on('exit', () => callback(null, Buffer.concat(chunks).toString('base64')))
  })
}, 1)

module.exports = {
  create: function(filepath, callback) {
    getVideoThumbnailWorker.push(filepath, callback)
  },

  abortAll: function() {
    getVideoThumbnailWorker.remove(() => true)
  }
}
