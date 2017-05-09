'use strict';

const middleware = require('./middleware');
const User = require('./user');
const Response = require('./response');

module.exports = function destroy (req, res) {
  middleware(req, res, () => {
    if (!req.userSession.userId) {
      return Response.unauthorized(res);
    }
    const userId = req.params.userId;
    /* istanbul ignore if */
    if (!userId) {
      console.error('Routing Error: Delete without UserId');
      return Response.internalError(res);
    }
    if (req.userSession.role !== 'admin' &&
        userId !== req.userSession.userId) {
      return Response.forbidden(res);
    }
    User.delete(userId, (err, response) => {
      /* istanbul ignore if */
      if (err) {
        console.error('User Deletion Error:', err);
        return Response.internalError(res);
      }
      if (req.userSession.userId === userId) {
        req.userSession.reset();
      }
      if (!response.success) {
        return Response.notFound(res);
      }
      Response.ok(res);
    });
  });
};
