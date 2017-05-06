'use strict';

const authorize = require('./lib/authorize');
const signin    = require('./lib/signin');
const signout   = require('./lib/signout');
const create    = require('./lib/create');
const update    = require('./lib/update');
const find      = require('./lib/find');
const list      = require('./lib/list');
const destroy   = require('./lib/destroy');
const ping      = require('./lib/ping');
const all       = require('./lib/all');

module.exports = {
  authorize,
  signin,
  signout,
  create,
  update,
  find,
  list,
  destroy,
  ping,
  all
};
