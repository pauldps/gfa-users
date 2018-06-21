'use strict'

const config = require('./configuration')
const password = require('./password')
const Response = require('./response')
const User = require('./user')

module.exports = function update (req, res) {
  // hash password if it's present
  if (req.body[config.fields.password]) {
    password(req.body, (err, data) => {
      /* istanbul ignore if */
      if (err) {
        return Response.badRequest(res, err)
      }
      _update(req, res, data)
    })
  } else {
    delete req.body[config.fields.password]
    _update(req, res, req.body)
  }
}

function _update (req, res, data) {
  delete data.id
  let userId = req.params.userId
  let role = data.role
  let sanitizedData = User.sanitize(data)
  if (req[config.session.name].role === 'admin') {
    sanitizedData.role = role
  }
  User.update(userId, sanitizedData, (err, entity) => {
    if (err) {
      return Response.badRequest(res, err)
    }
    Response.ok(res, {user: entity.plain()})
  })
}
