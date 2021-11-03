const http = require('http')
const parseUrl = require('parseurl')
const send = require('send')
const ws = require('ws')

const server = http.createServer(function onRequest (req, res) {
  send(req, parseUrl(req).pathname, { root: __dirname })
    .pipe(res)
})

const wss = new ws.WebSocketServer({ server })

let main = null
const sockets = []

let currentCanvasData = null

wss.on('connection', function connection (ws) {
  if (!main) {
    main = ws

    ws.send('main')

    ws.on('message', (data) => {
      console.log(data.length)
      currentCanvasData = data
      sockets.forEach(socket => {
        socket.send(data)
      })
    })

    ws.once('close', () => {
      console.log('close 1')
      main = null
    })
  } else {
    if (!sockets.includes(ws)) {
      sockets.push(ws)

      ws.send('member')

      if (currentCanvasData) {
        ws.send(currentCanvasData)
      }

      ws.once('close', () => {
        console.log('close 2')
        const index = sockets.indexOf(ws)
        if (index !== -1) {
          sockets.splice(index, 1)
        }
      })
    }
  }
})

const port = 8099
server.listen(port, '0.0.0.0', () => {
  console.log(`http://127.0.0.1:${port}/index.html`)
})
