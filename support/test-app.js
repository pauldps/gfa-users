'use strict';

require('../config/test');

const GoogleFunctionAuth = require('../index');

const expressApp = require('express')();
const bodyParser = require('body-parser');
expressApp.use(bodyParser.json());

expressApp.all('/all', function (req, res) {
  GoogleFunctionAuth.all(req, res);
});

expressApp.all('/create', function (req, res) {
  GoogleFunctionAuth.create(req, res);
});

expressApp.all('/update', function (req, res) {
  GoogleFunctionAuth.update(req, res);
});

expressApp.all('/find', function (req, res) {
  GoogleFunctionAuth.find(req, res);
});

expressApp.all('/list', function (req, res) {
  GoogleFunctionAuth.list(req, res);
});

expressApp.all('/signin', function (req, res) {
  GoogleFunctionAuth.signin(req, res);
});

expressApp.all('/ping', function (req, res) {
  GoogleFunctionAuth.ping(req, res);
});

expressApp.all('/authorized-function', function (req, res) {
  GoogleFunctionAuth.authorize(req, res, (req, res, user) => {
    res.status(200).json(user);
  });
});

expressApp.all('/authorized-function-with-error', function (req, res) {
  GoogleFunctionAuth.authorize(req, res, (req, res, user) => {
    res.status(200).json(user);
  }, (req, res, error) => {
    res.status(404).json({
      code: error,
      message: 'Pretend I do not exist'
    });
  });
});

expressApp.all('/authorized-function-without-next', function (req, res) {
  GoogleFunctionAuth.authorize(req, res);
});

expressApp.all('/signout', function (req, res) {
  GoogleFunctionAuth.signout(req, res);
});

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

module.exports = chai.request.agent(expressApp);
