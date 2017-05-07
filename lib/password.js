'use strict';

const Bcrypt = require('bcrypt');

module.exports = function password (body, callback) {
  if (!body.password) {
    return callback('EMPTY_PASSWORD');
  }
  let data = Object.assign({}, body);
  Bcrypt.hash(data.password, 10, function (err, hash) {
    /* istanbul ignore next */
    if (err) {
      console.error('Bcrypt Hash error:', err);
      return callback('PASSWORD_ERROR');
    }
    data.password = hash;
    callback(null, data);
  });
};
