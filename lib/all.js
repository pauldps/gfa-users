'use strict';

const Response = require('./response');
const route = require('./router');

module.exports = function all (req, res) {
  switch (req.method) {
  case 'POST':
  case 'PUT':
  case 'PATCH':
    return _parse(req, res, req.body);
  case 'GET':
  case 'DELETE':
    return _parse(req, res, req.query);
  }
  /* istanbul ignore next */
  Response.badRequest(res, 'INVALID_METHOD');
};

function _parse (req, res, data) {
  const action = data.action;
  if (!action) {
    return Response.badRequest(res, 'ACTION_REQUIRED');
  }
  route(req, res, action);
}