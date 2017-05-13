'use strict';

const config = require('./configuration');
const Response = require('./response');

module.exports = function signout (req, res) {
  req[config.session.name].reset();
  Response.ok(res);
};
