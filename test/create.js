'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;
const User = require('../lib/user');

describe('create', function () {

  it('fails on GET', function (done) {
    app.get('/create').end(function (err, res) {
      expect(res.body.reason).to.equal('INVALID_METHOD');
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('fails on PUT', function (done) {
    app.put('/create').end(function (err, res) {
      expect(res.body.reason).to.equal('INVALID_METHOD');
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('fails on PATCH', function (done) {
    app.patch('/create').end(function (err, res) {
      expect(res.body.reason).to.equal('INVALID_METHOD');
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('fails on DELETE', function (done) {
    app.del('/create').end(function (err, res) {
      expect(res.body.reason).to.equal('INVALID_METHOD');
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('fails with blank password', function (done) {
    let data = {password: ''};
    app.post('/create').send(data).end(function (err, res) {
      expect(res.body.reason).to.equal('EMPTY_PASSWORD');
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('fails with blank email', function (done) {
    let data = {password: 'abc123', email: ''};
    app.post('/create').send(data).end(function (err, res) {
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  // TODO: prevent creating user with role (sanitize input)

  it('creates user with valid data and returns sanitized user', function (done) {
    let data = {password: 'abc123', email: 'abc@test.com', role: 'admin'}; // role will be removed
    app.post('/create').send(data).end(function (err, res) {
      expect(res.body.code).to.equal('OK');
      expect(res.body.user.email).to.equal('abc@test.com');
      expect(res.statusCode).to.equal(200);
      expect(res.body.user.id).to.exist;
      expect(res.body.user.password).to.not.exist;
      expect(res.body.user.confirmationToken).to.not.exist;
      expect(res.body.user.role).to.not.equal('admin');
      _cleanup(res.body.user.id, done);
    });
  });

});

function _cleanup (userId, callback) {
  User.delete(userId, callback);
}
