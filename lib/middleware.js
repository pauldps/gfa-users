'use strict';

const cors = require('./cors');
const Response = require('./response');
const session = require('./session');

module.exports = function middleware (req, res, next) {
  _params(req);
  const validMethod = _method(req, res);
  /* istanbul ignore if */
  if (!validMethod) {
    return Response.notFound(res);
  }
  cors(req, res, () => {
    session(req, res, () => {
      next(req, res);
    });
  });
};

function _params (req) {
  /* istanbul ignore if */
  if (!req.params) {
    return;
  }
  let path = req.params['0'];
  if (!path) {
    return;
  }
  req.params.parts = req.params['0'].split('/');
  /* istanbul ignore if */
  if (req.params.parts[0] === '') {
    req.params.parts.shift();
  }
}

function _method (req) {
  switch (req.method) {
  case 'POST':
    return _post(req);
  case 'PUT':
  case 'PATCH':
    return _put(req);
  case 'GET':
    return _get(req);
  case 'DELETE':
    return _delete(req);
  case 'OPTIONS':
    return true; // handled by middleware
  /* istanbul ignore next */
  default:
    return false;
  }
}

function _post (req) {
  if (!req.params.parts) {
    req.params.action = 'create';
    return true;
  }
  let part = req.params.parts[0];
  switch (part) {
  case 'signin':
  case 'signout':
    req.params.action = part;
    break;
  /* istanbul ignore next */
  default:
    return false;
  }
  return true;
}

function _put (req) {
  if (!req.params.parts) {
    return false;
  }
  req.params.action = 'update';
  req.params.userId = req.params.parts[0];
  return true;
}

function _get (req) {
  if (!req.params.parts) {
    req.params.action = 'list';
    return true;
  }
  let part = req.params.parts[0];
  /* istanbul ignore else */
  if (part) {
    req.params.action = 'find';
    req.params.userId = part;
    return true;
  } else {
    return false;
  }
}

function _delete (req) {
  if (!req.params.parts) {
    return false;
  }
  let part = req.params.parts[0];
  if (part === 'signin') {
    req.params.action = 'signout';
    return true;
  }
  req.params.action = 'destroy';
  req.params.userId = part;
  return true;
}
