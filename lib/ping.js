'use strict';

const session = require('./session');

// Use this for health checks and stuff
module.exports = function ping (req, res) {
  session(req, res, () => {
    let result = {code: 'PONG'};
    let userId = req.userSession.userId;
    if (userId) {
      result.userId = userId;
    }
    res.status(200).json(result);
  });
};
