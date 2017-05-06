'use strict';

const session = require('./session');

module.exports = function signout (req, res) {
  session(req, res, () => {
    req.userSession.reset();
    res.status(200).json({code: 'OK'});
  });
};
