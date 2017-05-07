'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;

describe('all', function () {

  it('fails with missing action on POST', function (done) {
    let data = {a: '1'};
    app.post('/all').send(data).end(function (err, res) {
      expect(res.statusCode).to.equal(400);
      expect(res.body.reason).to.equal('ACTION_REQUIRED');
      done();
    });
  });

  it('fails with missing action on PUT', function (done) {
    let data = {a: '1'};
    app.put('/all').send(data).end(function (err, res) {
      expect(res.statusCode).to.equal(400);
      expect(res.body.reason).to.equal('ACTION_REQUIRED');
      done();
    });
  });

  it('fails with missing action on PATCH', function (done) {
    let data = {a: '1'};
    app.patch('/all').send(data).end(function (err, res) {
      expect(res.body.reason).to.equal('ACTION_REQUIRED');
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('fails with missing action on GET', function (done) {
    let data = {a: '1'};
    app.get('/all').query(data).end(function (err, res) {
      expect(res.body.reason).to.equal('ACTION_REQUIRED');
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('fails with missing action on DELETE', function (done) {
    let data = {a: '1'};
    app.del('/all').query(data).end(function (err, res) {
      expect(res.body.reason).to.equal('ACTION_REQUIRED');
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('calls router if parameters are valid', function (done) {
    let data = {action: 'ping'};
    app.get('/all').query(data).end(function (err, res) {
      expect(res.body.ping).to.equal('PONG');
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

});
