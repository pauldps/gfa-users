'use strict';

const Utils = require('./utils');

const signin    = require('./signin');
const signout   = require('./signout');
const create    = require('./create');
const update    = require('./update');
const find      = require('./find');
const list      = require('./list');
const destroy   = require('./destroy');

module.exports = function handleAll (req, res) {
  const body = req.body;
  if (!body || !body.action) {
    return Utils.badRequest(res, 'ACTION_REQUIRED');
  }
  if (!body.data) {
    return Utils.badRequest(res, 'DATA_REQUIRED');
  }
  _route(req, res);
};

const routes = new Map([
  ['POST', new Map([
    ['create', create],
    ['signin', signin],
    ['signout', signout]
  ])],
  ['PUT', new Map([
    ['update', update]
  ])],
  ['PATCH', new Map([
    ['update', update]
  ])],
  ['GET', new Map([
    ['find', find],
    ['list', list]
  ])],
  ['DELETE', new Map([
    ['destroy', destroy],
    ['delete', destroy],
    ['signin', signout] // "delete that signin"
  ])]
]);

function _route (req, res) {
  const methodRoute = routes.get(req.method);
  if (!methodRoute) {
    return Utils.badRequest(res, 'INVALID_METHOD');
  }
  const actionFunction = methodRoute.get(req.body.action);
  if (!actionFunction) {
    return Utils.badRequest(res, 'INVALID_ACTION');
  }
  actionFunction(req, res);
}
