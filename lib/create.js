'use strict';

const cors = require('./cors');
const password = require('./password');
const Response = require('./response');
const User = require('./user');

module.exports = function create (req, res) {
  cors(req, res, () => {
    if (req.method !== 'POST') {
      return Response.badRequest(res, 'INVALID_METHOD');
    }
    delete req.body.id;
    password(req.body, (err, data) => {
      if (err) {
        return Response.badRequest(res, err);
      }
      _create(req, res, data);
    });
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
