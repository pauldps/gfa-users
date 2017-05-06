'use strict';

const session = require('./session');
const Response = require('./response');

module.exports = function authorize (req, res, next, err) {
  session(req, res, () => {
    let userId = req.userSession.userId;
    if (!userId) {
      if (err) {
        return err(req, res, 'UNAUTHORIZED');
      }
      return Response.unauthorized(res);
    }
    if (!next) {
      console.error('Authorize: No next() function specified');
      return Response.internalError(res);
    }
    next(req, res, {
      id: req.userSession.userId,
      username: req.userSession.username,
      email: req.userSession.email,
      role: req.userSession.role
    });
  });
};
