'use strict';

const Response = require('./response');
const session = require('./session');
const User = require('./user');

module.exports = function list (req, res) {
  session(req, res, () => {
    if (!req.userSession.userId) {
      return Response.unauthorized(res);
    }
    if (req.userSession.role !== 'admin') {
      return Response.forbidden(res);
    }
    let options = {};
    let start = req.query.start;
    if (start) {
      options.start = start;
    }
    let limit = req.query.limit;
    if (limit) {
      if (limit > 20 || limit < 1) {
        limit = 20;
      }
      options.limit = limit;
    }
    User.list(options, (err, response) => {
      /* istanbul ignore next */
      if (err) {
        console.error('List Error:', err);
        Response.internalError(res);
        return;
      }
      Response.ok(res, {
        items: response.entities,
        next: response.nextPageCursor,
        limit: limit
      });
    });
  });
};
