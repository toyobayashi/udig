const http = require('http')
const url = require('url')
const parseUrl = require('parseurl')
const ws = require('ws')

const express = require('express')
const cors = require('cors')

const { routes } = require('./routes.js')
const { Player, Game } = require('./game')
const { WebSocketMessage } = require('./util.js')

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json({
  verify (_req, res, buf, encoding) {
    const jsonString = buf.toString(encoding)
    try {
      JSON.parse(jsonString)
    } catch (_) {
      res.status(400).json({ message: 'Invalid JSON' })
      throw new Error('Invalid JSON')
    }
  }
}))

routes(app)

const server = http.createServer(app)

const wss = new ws.WebSocketServer({ noServer: true })

/** @type {Map<string, import('./game').Game>} */
const rooms = new Map()

server.on('upgrade', function upgrade (request, socket, head) {
  const search = parseUrl(request).search
  const searchParams = new url.URLSearchParams(search)
  console.log(searchParams)
  if (!searchParams.has('id') || !searchParams.has('roomId')) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
    return
  }

  wss.handleUpgrade(request, socket, head, function done (ws) {
    wss.emit('connection', ws, request/* , client */)
  })
})

wss.on('connection', function connection (ws, request) {
  const search = parseUrl(request).search
  const searchParams = new url.URLSearchParams(search)
  const roomId = searchParams.get('roomId')
  const id = searchParams.get('id')
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Game())
  }
  const game = rooms.get(roomId)
  let player = game.players.filter(p => p.id === id)[0]
  if (player == null) {
    player = new Player(id, id, ws)
    for (let i = 0; ;i++) {
      if (game.players[i] == null) {
        game.players[i] = player
        break
      }
    }
  }
  ws.player = player
  ws.game = game

  ws.send(JSON.stringify(new WebSocketMessage('game-sync', {
    ...ws.game.toJSON(),
    myId: ws.player.id
  })))

  // if (!main) {
  //   main = ws

  //   ws.send('main')

  //   ws.on('message', (data) => {
  //     console.log(data.length)
  //     currentCanvasData = data
  //     sockets.forEach(socket => {
  //       socket.send(data)
  //     })
  //   })

  //   ws.once('close', () => {
  //     console.log('close 1')
  //     main = null
  //   })
  // } else {
  //   if (!sockets.includes(ws)) {
  //     sockets.push(ws)

  //     ws.send('member')

  //     if (currentCanvasData) {
  //       ws.send(currentCanvasData)
  //     }

  //     ws.once('close', () => {
  //       console.log('close 2')
  //       const index = sockets.indexOf(ws)
  //       if (index !== -1) {
  //         sockets.splice(index, 1)
  //       }
  //     })
  //   }
  // }
})

const port = 8099
server.listen(port, '0.0.0.0', () => {
  console.log(`http://127.0.0.1:${port}`)
})
