function wrap (fn) {
  return async function (req, res, next) {
    try {
      await Promise.resolve(fn(req, res, next))
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server error' })
    }
  }
}

class WebSocketMessage {
  constructor (channel, data) {
    this.channel = channel
    this.data = data
  }
}

exports.wrap = wrap
exports.WebSocketMessage = WebSocketMessage
