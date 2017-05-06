'use strict';

require('../config/test');

const GoogleFunctionAuth = require('../index');

const expressApp = require('express')();
const bodyParser = require('body-parser');
expressApp.use(bodyParser.json());

expressApp.all('/all', function (req, res) {
  GoogleFunctionAuth.all(req, res);
});

expressApp.post('/create', function (req, res) {
  GoogleFunctionAuth.create(req, res);
});

expressApp.post('/signin', function (req, res) {
  GoogleFunctionAuth.signin(req, res);
});

expressApp.get('/ping', function (req, res) {
  GoogleFunctionAuth.ping(req, res);
});

expressApp.get('/authorized-function', function (req, res) {
  GoogleFunctionAuth.authorize(req, res, (req, res, user) => {
    res.status(200).json(user);
  });
});

expressApp.get('/authorized-function-with-error', function (req, res) {
  GoogleFunctionAuth.authorize(req, res, (req, res, user) => {
    res.status(200).json(user);
  }, (req, res, error) => {
    res.status(404).json({
      code: error,
      message: 'Pretend I do not exist'
    });
  });
});

expressApp.get('/authorized-function-without-next', function (req, res) {
  GoogleFunctionAuth.authorize(req, res);
});

expressApp.post('/signout', function (req, res) {
  GoogleFunctionAuth.signout(req, res);
});

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

module.exports = chai.request.agent(expressApp);
