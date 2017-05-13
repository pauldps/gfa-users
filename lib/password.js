'use strict';

const config = require('./configuration');
const Bcrypt = require('bcrypt');

module.exports = function password (body, callback) {
  if (!body[config.fields.password]) {
    return callback('EMPTY_PASSWORD');
  }
  let data = Object.assign({}, body);
  Bcrypt.hash(data[config.fields.password], 10, function (err, hash) {
    /* istanbul ignore if */
    if (err) {
      console.error('Bcrypt Hash error:', err);
      return callback('PASSWORD_ERROR');
    }
    data[config.fields.password] = hash;
    callback(null, data);
  });
};
