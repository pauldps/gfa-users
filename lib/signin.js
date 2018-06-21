'use strict'

const config = require('./configuration')
const Bcrypt = require('bcrypt')
const Response = require('./response')
const User = require('./user')

module.exports = function signin (req, res) {
  if (!req.body[config.fields.primary]) {
    return Response.badRequest(res, 'PRIMARY_FIELD_REQUIRED')
  }
  if (!req.body[config.fields.password]) {
    return Response.badRequest(res, 'PASSWORD_REQUIRED')
  }
  _signin(req, res)
}

function _signin (req, res) {
  let conditions = {}
  conditions[config.fields.primary] = req.body[config.fields.primary]
  User.findOne(conditions, (err, entity) => {
    if (err) {
      /* istanbul ignore else */
      if (err.code === 404) {
        return Response.notFound(res)
      } else {
        console.error('Signin User Find error:', err)
        return Response.internalError(res)
      }
    }
    let password = req.body[config.fields.password]
    Bcrypt.compare(password, entity[config.fields.password], (err, valid) => {
      /* istanbul ignore if */
      if (err) {
        console.error('Signin Password compare error:', err)
        return Response.internalError(res)
      }
      if (!valid) {
        return Response.badRequest(res, 'WRONG_PASSWORD')
      }
      let cookieName = config.session.name
      let fields = config.fields
      req[cookieName].userId = entity.entityKey.id
      req[cookieName][fields.role] = entity[fields.role]
      req[cookieName][fields.email] = entity[fields.email]
      req[cookieName][fields.username] = entity[fields.username]
      Response.ok(res, {user: entity.plain()})
    })
  })
}
