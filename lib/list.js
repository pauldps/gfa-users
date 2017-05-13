'use strict';

const Response = require('./response');
const User = require('./user');

module.exports = function list (req, res) {
  let options = {};
  let start = req.query.start;
  if (start) {
    options.start = start;
  }
  let limit = +(req.query.limit || 20);
  if (limit > 20 || limit < 1) {
    limit = 20;
  }
  options.limit = limit;
  User.list(options, (err, response) => {
    /* istanbul ignore if */
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
};
