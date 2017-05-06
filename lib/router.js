'use strict';

const Utils = require('./utils');

const signin    = require('./signin');
const signout   = require('./signout');
const create    = require('./create');
const update    = require('./update');
const find      = require('./find');
const list      = require('./list');
const destroy   = require('./destroy');

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
    ['list', list],
    ['ping', _ping]
  ])],
  ['DELETE', new Map([
    ['destroy', destroy],
    ['delete', destroy],
    ['signin', signout] // "delete that signin"
  ])]
]);

module.exports = function route (req, res, action) {
  const methodRoute = routes.get(req.method);
  if (!methodRoute) {
    return Utils.badRequest(res, 'INVALID_METHOD');
  }
  const actionFunction = methodRoute.get(action);
  if (!actionFunction) {
    return Utils.badRequest(res, 'INVALID_ACTION');
  }
  _parse(req);
  actionFunction(req, res);
};

// Parse request format from `all`.
function _parse (req) {
  if (req.body.data) {
    req.body = req.body.data;
  }
}

function _ping (req, res) {
  res.status(200).json({code: 'PONG'});
}
