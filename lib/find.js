'use strict';

const Response = require('./response');
const session = require('./session');
const User = require('./user');

module.exports = function find (req, res) {
  session(req, res, () => {
    if (!req.userSession.userId) {
      return Response.unauthorized(res);
    }
    if (req.userSession.role !== 'admin') {
      return Response.forbidden(res);
    }
    const userId = req.query.userId || res.query.userid || res.query.id;
    if (!userId) {
      return Response.badRequest('USERID_REQUIRED');
    }
    User.get(userId, (err, entity) => {
      /* istanbul ignore next */
      if (err) {
        console.error('Find User error:', err);
        return Response.internalError(res);
      }
      if (!entity) {
        return Response.notFound(res);
      }
      Response.ok(res, {user: entity.plain()});
    });
  });
};
