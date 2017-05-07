'use strict';

const session = require('./session');
const User = require('./user');
const Response = require('./response');

module.exports = function destroy (req, res) {
  session(req, res, () => {
    if (req.userSession.userId) {
      return Response.unauthorized(res);
    }
    const userId = req.query.userId;
    if (!userId) {
      return Response.badRequest(res, 'USERID_REQUIRED');
    }
    if (req.userSession.role !== 'admin' &&
        userId !== req.userSession.userId) {
      return Response.forbidden(res);
    }
    User.delete(userId, (err) => {
      /* istanbul ignore next */
      if (err) {
        console.error('User Deletion Error:', err);
        return Response.internalError(res);
      }
      // Do not care if deletion failed;
      //   record doesn't exist anyway
      Response.ok(res);
    });
  });
};
