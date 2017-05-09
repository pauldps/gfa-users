'use strict';

const cors = require('./cors');
const Response = require('./response');
const session = require('./session');

module.exports = function middleware (req, res, next) {
  _params(req);
  _method(req);
  cors(req, res, () => {
    if (req.method === 'OPTIONS') {
      return Response.ok(res);
    }
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
  }
}

function _post (req) {
  if (!req.params.parts) {
    req.params.action = 'create';
    return;
  }
  let part = req.params.parts[0];
  switch (part) {
  case 'signin':
  case 'signout':
    req.params.action = part;
    break;
  }
}

function _put (req) {
  if (!req.params.parts) {
    return;
  }
  req.params.action = 'update';
  req.params.userId = req.params.parts[0];
}

function _get (req) {
  if (!req.params.parts) {
    req.params.action = 'list';
    return;
  }
  let part = req.params.parts[0];
  if (part) {
    req.params.action = 'find';
    req.params.userId = part;
    return;
  }
}

function _delete (req) {
  if (!req.params.parts) {
    return;
  }
  let part = req.params.parts[0];
  if (part === 'signin') {
    req.params.action = 'signout';
    return;
  }
  req.params.action = 'destroy';
  req.params.userId = part;
}
