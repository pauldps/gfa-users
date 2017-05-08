'use strict';

const middleware = require('./middleware');
const password = require('./password');
const Response = require('./response');
const User = require('./user');

module.exports = function update (req, res) {
  middleware(req, res, () => {
    if (req.method !== 'PUT' && req.method !== 'PATCH') {
      return Response.notFound(res);
    }
    if (!req.userSession.userId) {
      return Response.unauthorized(res);
    }
    if (!req.body.id) {
      return Response.badRequest(res, 'USERID_REQUIRED');
    }
    // admins can edit anyone
    // other users can only edit themselves
    if (req.userSession.role !== 'admin' && req.userSession.userId !== req.body.id) {
      return Response.forbidden(res);
    }
    // hash password if it's present
    if (req.body.password) {
      password(req.body, (err, data) => {
        /* istanbul ignore if */
        if (err) {
          return Response.badRequest(res, err);
        }
        _update(req, res, data);
      });
    } else {
      delete req.body.password;
      _update(req, res, req.body);
    }
  });
};

function _update (req, res, data) {
  let userId = data.id;
  delete data.id;
  User.update(userId, User.sanitize(data), (err, entity) => {
    if (err) {
      return Response.badRequest(res, err);
    }
    Response.ok(res, {user: entity.plain()});
  });
}
