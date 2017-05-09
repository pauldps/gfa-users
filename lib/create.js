'use strict';

const middleware = require('./middleware');
const password = require('./password');
const Response = require('./response');
const User = require('./user');

module.exports = function create (req, res) {
  middleware(req, res, () => {
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
  let user = new User(User.sanitize(data));
  user.save((err, entity) => {
    if (err) {
      return Response.badRequest(res, err);
    }
    Response.ok(res, {user: entity.plain()});
  });
}
