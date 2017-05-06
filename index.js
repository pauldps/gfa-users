'use strict';

const signin    = require('./lib/signin');
const signout   = require('./lib/signout');
const create    = require('./lib/create');
const update    = require('./lib/update');
const find      = require('./lib/find');
const list      = require('./lib/list');
const destroy   = require('./lib/destroy');
const all       = require('./lib/all');

module.exports = {
  signin,
  signout,
  create,
  update,
  find,
  list,
  destroy,
  all
};
