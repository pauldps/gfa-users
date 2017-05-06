'use strict';

const session = require('./session');
const Response = require('./response');

// Use this for health checks and stuff
module.exports = function ping (req, res) {
  session(req, res, () => {
    let result = {ping: 'PONG'};
    let userId = req.userSession.userId;
    if (userId) {
      result.userId = userId;
    }
    Response.ok(res, result);
  });
};
