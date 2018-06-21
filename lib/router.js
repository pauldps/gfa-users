'use strict'

const Response = require('./response')

const signin = require('./signin')
const signout = require('./signout')
const create = require('./create')
const update = require('./update')
const find = require('./find')
const list = require('./list')
const destroy = require('./destroy')

const actions = {
  signin,
  signout,
  create,
  update,
  find,
  list,
  destroy
}

module.exports = function route (req, res) {
  const actionFunction = actions[req.params.action] // action has been set in middleware
  /* istanbul ignore if */
  if (!actionFunction) {
    return Response.notFound(res)
  }
  actionFunction(req, res)
}
