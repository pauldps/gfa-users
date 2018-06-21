'use strict'

const config = require('./configuration')
const middleware = require('./middleware')
const Response = require('./response')

module.exports = function authorize (req, res, next, err) {
  middleware(req, res, () => {
    let session = req[config.session.name]
    let userId = session.userId
    if (!userId) {
      if (err) {
        return err(req, res)
      }
      return Response.unauthorized(res)
    }
    if (!next) {
      console.error('Authorize: No next() function specified')
      return Response.internalError(res)
    }
    next(req, res, {
      id: session.userId,
      username: session.username,
      email: session.email,
      role: session.role
    })
  })
}
