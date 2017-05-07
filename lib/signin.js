'use strict';

const Bcrypt = require('bcrypt');
const cors = require('./cors');
const Response = require('./response');
const session = require('./session');
const User = require('./user');

module.exports = function signin (req, res) {
  cors(req, res, () => {
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
    /* istanbul ignore next */
    if (err) {
      console.error('Signin User Find error:', err);
      return Response.internalError(res);
    }
    if (!entity) {
      return Response.notFound(res);
    }
    Bcrypt.compare(req.body.password, entity.password, (err, valid) => {
      /* istanbul ignore next */
      if (err) {
        console.error('Signin Password compare error:', err);
        return Response.internalError(res);
      }
      if (!valid) {
        return Response.badRequest(res, 'WRONG_PASSWORD');
      }
      session(req, res, () => {
        req.userSession.userId = entity.entityKey.id;
        req.userSession.role = entity.role;
        req.userSession.email = entity.email;
        req.userSession.username = entity.username;
        Response.ok(res, {user: entity.plain()});
      });
    });
  });
}
