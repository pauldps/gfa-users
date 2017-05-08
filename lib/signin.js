'use strict';

const Bcrypt = require('bcrypt');
const middleware = require('./middleware');
const Response = require('./response');
const User = require('./user');

module.exports = function signin (req, res) {
  middleware(req, res, () => {
    if (!req.body.email) {
      return Response.badRequest(res, 'EMAIL_REQUIRED');
    }
    if (!req.body.password) {
      return Response.badRequest(res, 'PASSWORD_REQUIRED');
    }
    _signin(req, res);
  });
};

function _signin (req, res) {
  User.findOne({email: req.body.email}, (err, entity) => {
    if (err) {
      /* istanbul ignore else */
      if (err.code === 404) {
        return Response.notFound(res);
      } else {
        console.error('Signin User Find error:', err);
        return Response.internalError(res);
      }
    }
    Bcrypt.compare(req.body.password, entity.password, (err, valid) => {
      /* istanbul ignore if */
      if (err) {
        console.error('Signin Password compare error:', err);
        return Response.internalError(res);
      }
      if (!valid) {
        return Response.badRequest(res, 'WRONG_PASSWORD');
      }
      req.userSession.userId = entity.entityKey.id;
      req.userSession.role = entity.role;
      req.userSession.email = entity.email;
      req.userSession.username = entity.username;
      Response.ok(res, {user: entity.plain()});
    });
  });
}
