'use strict';

const corsFn = require('cors')();

module.exports = function _cors (req, res, next) {
  if (req.method === 'OPTIONS') {
    corsFn(req, res);
    return;
  }
  // Some workflows can call this more than once.
  // Also, sessions call this internally.
  if (res.locals._cors) {
    next(req, res);
    return;
  }
  corsFn(req, res, () => {
    res.locals._cors = true;
    next(req, res);
  });
};
