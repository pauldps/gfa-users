'use strict'

const config = require('./lib/configuration')

module.exports = function (customConfig) {
  config.override(customConfig)

  /* istanbul ignore if */
  if (!config.session.secret) {
    throw new Error('config.session.secret not set')
  }

  const authorize = require('./lib/authorize')
  const handle = require('./lib/handle')

  return {authorize, handle}
}
