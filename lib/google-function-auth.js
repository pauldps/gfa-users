'use strict';

function create (req, res) {
  res.status(200).send('NOT IMPLEMENTED');
}

function update (req, res) {
  res.status(200).send('NOT IMPLEMENTED');
}

function find (req, res) {
  res.status(200).send('NOT IMPLEMENTED');
}

function list (req, res) {
  res.status(200).send('NOT IMPLEMENTED');
}

function destroy (req, res) {
  res.status(200).send('NOT IMPLEMENTED');
}

function handleAll (req, res) {
  const body = req.body;
  if (!body || !body.action) {
    return _badRequest(res, 'ACTION_REQUIRED');
  }
  if (!body.data) {
    return _badRequest(res, 'DATA_REQUIRED');
  }
  _route(req, res);
}

const routes = new Map([
  ['POST', new Map([
    ['create', create]
  ])],
  ['PUT', new Map([
    ['update', update]
  ])],
  ['PATCH', new Map([
    ['update', update]
  ])],
  ['GET', new Map([
    ['find', find],
    ['list', list]
  ])],
  ['DELETE', new Map([
    ['destroy', destroy],
    ['delete', destroy]
  ])]
]);

function _route (req, res) {
  const methodRoute = routes.get(req.method);
  if (!methodRoute) {
    return _badRequest(res, 'INVALID_METHOD');
  }
  const actionFunction = methodRoute.get(req.body.action);
  if (!actionFunction) {
    return _badRequest(res, 'INVALID_ACTION');
  }
  actionFunction(req, res);
}


function _badRequest (res, code) {
  res.status(400).json({code});
}

module.exports = {
  create, update, find, list, destroy, handleAll
};
