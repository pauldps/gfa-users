'use strict';

const Utils = require('./utils');
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
  res.status(400).json({code: 'INVALID_METHOD'});
};

function _parse (req, res, data) {
  const action = data.action;
  if (!action) {
    return Utils.badRequest(res, 'ACTION_REQUIRED');
  }
  route(req, res, action);
}
