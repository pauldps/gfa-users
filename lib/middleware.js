'use strict';

const cors = require('./cors');
const session = require('./session');

module.exports = function middleware (req, res, next) {
  _paramParts(req);
  cors(req, res, () => {
    session(req, res, () => {
      next(req, res);
    });
  });
};

// Assembles req.params.parts
function _paramParts (req) {
  /* istanbul ignore if */
  if (!req.params) {
    return;
  }
  let path = req.params['0'];
  if (!path) {
    return;
  }
  req.params.parts = req.params['0'].split('/');
  if (req.params.parts[0] === '') {
    req.params.parts.shift();
  }
}
