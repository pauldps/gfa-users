'use strict';

const Bcrypt = require('bcrypt');
const User = require('./user');
const Utils = require('./utils');

const session = require('./session');

module.exports = function signin (req, res) {
  if (!req.body.email) {
    return Utils.badRequest(res, 'EMAIL_REQUIRED');
  }
  if (!req.body.password) {
    return Utils.badRequest(res, 'PASSWORD_REQUIRED');
  }
  User.findOne({email: req.body.email}, (err, entity) => {
    if (err) {
      console.log('Signin User Find error:', err);
      res.status(500).json({code: 'INTERNAL_ERROR'});
      return;
    }
    if (!entity) {
      res.status(404).json({code: 'NOT_FOUND'});
      return;
    }
    Bcrypt.compare(req.body.password, entity.password, (err, valid) => {
      if (err) {
        console.log('Signin Password error:', err);
        res.status(500).json({code: 'INTERNAL_ERROR'});
        return;
      }
      if (!valid) {
        res.status(400).json({code: 'WRONG_PASSWORD'});
        return;
      }
      session(req, res, () => {
        req.userSession.userId = entity.entityKey.id;
        req.userSession.userRole = entity.role;
        res.status(200).json({
          code: 'OK',
          user: entity.plain()
        });
      });
    });
  });

};
