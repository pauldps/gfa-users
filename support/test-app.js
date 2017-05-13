'use strict';

require('../config/test');

const GoogleFunctionAuth = require('../index')({
  session: {secret: 'abc'}
});

const expressApp = require('express')();
const bodyParser = require('body-parser');
expressApp.use(bodyParser.json());

expressApp.all('/users/?*', function (req, res) {
  GoogleFunctionAuth.handle(req, res);
});

expressApp.all('/authorized-function', function (req, res) {
  GoogleFunctionAuth.authorize(req, res, function (req, res, user) {
    res.status(200).json(user);
  });
});

expressApp.all('/authorized-function-with-error', function (req, res) {
  GoogleFunctionAuth.authorize(req, res, (req, res, user) => {
    res.status(200).json(user);
  }, (req, res) => {
    res.status(404).json({
      code: 'CUSTOM',
      message: 'Pretend I do not exist'
    });
  });
});

expressApp.all('/authorized-function-without-next', function (req, res) {
  GoogleFunctionAuth.authorize(req, res);
});

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

module.exports = chai.request.agent(expressApp);
