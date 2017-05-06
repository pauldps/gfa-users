'use strict';

const session = require('./session');

module.exports = function authorize (req, res, next, err) {
  session(req, res, () => {
    let userId = req.userSession.userId;
    if (!userId) {
      if (err) {
        return err(req, res, 'UNAUTHORIZED');
      }
      return res.status(401).json({code: 'UNAUTHORIZED'});
    }
    if (!next) {
      console.log('Authorize: No next() function specified');
      return res.status(500).json({code: 'INTERNAL_ERROR'});
    }
    next(req, res, {
      id: req.userSession.userId,
      username: req.userSession.username,
      email: req.userSession.email,
      role: req.userSession.role
    });
  });
};
