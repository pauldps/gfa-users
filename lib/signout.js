'use strict';

const Response = require('./response');
const middleware = require('./middleware');

module.exports = function signout (req, res) {
  middleware(req, res, () => {
    req.userSession.reset();
    Response.ok(res);
  });
};
