'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;

describe('GoogleFunctionAuth', function () {

  this.timeout(5000);

  describe('handleAll', function () {

    it('fails with missing action', function (done) {
      let data = {a: '1'};
      app.post('/handleAll').send(data).end(function (err, res) {
        expect(res.statusCode).to.equal(400);
        expect(res.body.code).to.equal('ACTION_REQUIRED');
        done();
      });
    });

    it('fails with missing data', function (done) {
      let data = {action: 'create'};
      app.post('/handleAll').send(data).end(function (err, res) {
        expect(res.statusCode).to.equal(400);
        expect(res.body.code).to.equal('DATA_REQUIRED');
        done();
      });
    });

    it('fails with unsupported action', function (done) {
      let data = {action: 'test', data: {}};
      app.post('/handleAll').send(data).end(function (err, res) {
        expect(res.statusCode).to.equal(400);
        expect(res.body.code).to.equal('INVALID_ACTION');
        done();
      });
    });

  });

});
