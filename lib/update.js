'use strict';

const password = require('./password');
const Response = require('./response');
const session = require('./session');
const User = require('./user');

module.exports = function update (req, res) {
  session(req, res, () => {
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
  User.update(userId, data, (err, entity) => {
    if (err) {
      return Response.badRequest(res, err);
    }
    Response.ok(res, {user: entity.plain()});
  });
}
