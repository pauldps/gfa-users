'use strict';

require('../config/test');

const GoogleFunctionAuth = require('../index');

const expressApp = require('express')();
const bodyParser = require('body-parser');
expressApp.use(bodyParser.json());

expressApp.post('/handleAll', function (req, res) {
  GoogleFunctionAuth.handleAll(req, res);
});

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

module.exports = chai.request(expressApp);
