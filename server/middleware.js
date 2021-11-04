const { wrap } = require('./util.js')

const auth = () => {
  return wrap((req, res, next) => {
    const authHeader = req.header('Authorization')
    if (!authHeader) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    res.locals.token = authHeader
    next()
  })
}

exports.auth = auth
