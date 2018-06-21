'use strict'

const config = require('./configuration')
const sessions = require('client-sessions')

const session = sessions({
  cookieName: config.session.name,
  secret: config.session.secret,
  duration: config.session.duration,
  activeDuration: config.session.activeDuration
})

module.exports = function _session (req, res, next) {
  session(req, res, () => {
    next(req, res)
  })
}
