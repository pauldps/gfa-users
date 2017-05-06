'use strict';

const session = require('./session');
const User = require('./user');
const Response = require('./response');

module.exports = function destroy (req, res) {
  const userId = req.query.userId;
  if (!userId) {
    return Response.badRequest(res, 'USERID_REQUIRED');
  }
  session(req, res, () => {
    if (req.userSession.userId) {
      return Response.unauthorized(res);
    }
    if (req.userSession.role !== 'admin' &&
        userId !== req.userSession.userId) {
      return Response.forbidden(res);
    }
    User.delete(userId, (err) => {
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
