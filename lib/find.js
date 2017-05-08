'use strict';

const middleware = require('./middleware');
const Response = require('./response');
const User = require('./user');

module.exports = function find (req, res) {
  middleware(req, res, () => {
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
      /* istanbul ignore if */
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
