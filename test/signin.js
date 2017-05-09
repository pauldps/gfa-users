'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;
const helpers = require('../support/test-helpers');
const User = require('../lib/user');

describe('signin', function () {

  let user;

  before(function (done) {
    let data = {email: 'signintest@test.com', password: 'abc12345'};
    helpers.create_entity(data, (err, entity) => {
      user = entity;
      done(err);
    });
  });

  after(function (done) {
    helpers.delete_all_users_and_sign_out(done);
  });

  it('fails with blank email', function (done) {
    let data = {password: 'abc123', email: ''};
    app.post('/users/signin').send(data).end(function (err, res) {
      expect(res.body.reason).to.equal('EMAIL_REQUIRED');
      expect(res.body.code).to.equal('BAD_REQUEST');
      done();
    });
  });

  it('fails with blank password', function (done) {
    let data = {email: 'signintest@test.com', password: ''};
    app.post('/users/signin').send(data).end(function (err, res) {
      expect(res.body.reason).to.equal('PASSWORD_REQUIRED');
      expect(res.body.code).to.equal('BAD_REQUEST');
      done();
    });
  });

  it('fails with wrong password', function (done) {
    let data = {email: 'signintest@test.com', password: 'wrongpass'};
    app.post('/users/signin').send(data).end(function (err, res) {
      expect(res.body.reason).to.equal('WRONG_PASSWORD');
      expect(res.body.code).to.equal('BAD_REQUEST');
      done();
    });
  });

  it('signs user in with correct credentials', function (done) {
    let data = {password: 'abc12345', email: 'signintest@test.com'};
    app.post('/users/signin').send(data).end(function (err, res) {
      expect(res.body.code).to.equal('OK');
      expect(res).to.have.cookie('userSession');
      expect(res.body.user.email).to.equal('signintest@test.com');
      expect(res.statusCode).to.equal(200);
      expect(res.body.user.id).to.exist;
      expect(res.body.user.password).to.not.exist;
      expect(res.body.user.confirmationToken).to.not.exist;
      // Session test
      app.get(`/users/${res.body.user.id}`).end((err, res) => {
        expect(res.body.code).to.equal('OK');
        done();
      });
    });
  });

});
