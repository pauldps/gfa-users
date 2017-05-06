'use strict';

const User = require('./user');
const password = require('./password');

module.exports = function create (req, res) {
  password(req.body, (err, data) => {
    if (err) {
      res.status(400).json({code: err});
      return;
    }
    _create(req, res, data);
  });
};

function _create (req, res, data) {
  let user = new User(data);
  user.save((err, entity) => {
    if (err) {
      res.status(400).json({
        code: 'ERROR',
        error: err
      });
      return;
    }
    res.status(200).json({
      code: 'OK',
      user: entity.plain()
    });
  });
}
