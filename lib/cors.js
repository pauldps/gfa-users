'use strict';

const corsFn = require('cors')();

module.exports = function _cors (req, res, next) {
  corsFn(req, res, () => {
    next(req, res);
  });
};
