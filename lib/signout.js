'use strict';

const Response = require('./response');
const session = require('./session');

module.exports = function signout (req, res) {
  session(req, res, () => {
    req.userSession.reset();
    Response.ok(res);
  });
};
