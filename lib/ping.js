'use strict';

const middleware = require('./middleware');
const Response = require('./response');

// Use this for health checks and stuff
module.exports = function ping (req, res) {
  middleware(req, res, () => {
    let result = {ping: 'PONG'};
    let userId = req.userSession.userId;
    if (userId) {
      result.userId = userId;
    }
    Response.ok(res, result);
  });
};
