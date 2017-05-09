'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;
const helpers = require('../support/test-helpers');
const User = require('../lib/user');

describe('create', function () {

  after(function (done) {
    helpers.delete_all_users_and_sign_out(done);
  });

  it('fails with blank password', function (done) {
    let data = {password: ''};
    app.post('/users').send(data).end(function (err, res) {
      expect(res.body.reason).to.equal('EMPTY_PASSWORD');
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('fails with blank email', function (done) {
    let data = {password: 'abc123', email: ''};
    app.post('/users').send(data).end(function (err, res) {
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('creates user with valid data and returns sanitized user', function (done) {
    let data = {password: 'abc123', email: 'abc@test.com', role: 'admin'}; // role will be removed
    app.post('/users').send(data).end(function (err, res) {
      expect(res.body.code).to.equal('OK');
      expect(res.body.user.email).to.equal('abc@test.com');
      expect(res.statusCode).to.equal(200);
      expect(res.body.user.id).to.exist;
      expect(res.body.user.password).to.not.exist;
      expect(res.body.user.confirmationToken).to.not.exist;
      expect(res.body.user.role).to.not.equal('admin');
      done();
    });
  });

});
