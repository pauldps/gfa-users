'use strict';

const password = require('./password');
const Response = require('./response');
const User = require('./user');

module.exports = function create (req, res) {
  password(req.body, (err, data) => {
    if (err) {
      return Response.badRequest(res, err);
    }
    _create(req, res, data);
  });
};

function _create (req, res, data) {
  let user = new User(data);
  user.save((err, entity) => {
    if (err) {
      return Response.badRequest(res, err);
    }
    Response.ok(res, {user: entity.plain()});
  });
}
