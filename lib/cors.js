'use strict';

const Response = require('./response');

module.exports = function _cors (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === 'OPTIONS') {
    return Response.ok(res);
  }
  next(req, res);
};
