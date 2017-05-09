'use strict';

const middleware = require('./middleware');
const Response = require('./response');
const User = require('./user');

module.exports = function find (req, res) {
  middleware(req, res, () => {
    if (!req.userSession.userId) {
      return Response.unauthorized(res);
    }
    const userId = req.params.userId;
    /* istanbul ignore if */
    if (!userId) {
      console.error('Routing Error: Find without UserId');
      return Response.internalError(res);
    }
    if (req.userSession.role !== 'admin' &&
        req.userSession.userId !== userId) {
      return Response.forbidden(res);
    }
    User.get(userId, (err, entity) => {
      /* istanbul ignore if */
      if (err) {
        if (err.code === 404) {
          return Response.notFound(res);
        }
        console.error('Find User error:', err);
        return Response.internalError(res);
      }
      Response.ok(res, {user: entity.plain()});
    });
  });
};
