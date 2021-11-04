const express = require('express')
const { wrap } = require('./util.js')
const { auth } = require('./middleware.js')

const options = {
  caseSensitive: true,
  strict: true
}

const apiJoin = wrap(async function (_req, res) {
  res.status(200).json({ message: 'ok', data: true })
})

function routes (app) {
  const apiRouter = express.Router(options)
  const rootRouter = express.Router(options)

  const authMiddleware = auth()

  rootRouter.get('/', function (_req, res) {
    res.status(200).json({ message: 'udig' })
  })

  apiRouter.get('/join', authMiddleware, apiJoin)

  app.use('/api/v1', apiRouter)
  app.use('/', rootRouter)
}

exports.routes = routes
