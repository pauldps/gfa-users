'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;
const User = require('../lib/user');

describe('signin', function () {

  let user;

  before((done) => {
    let data = {email: 'signintest@test.com', password: 'abc12345'}
    app.post('/create').send(data).end((err, res) => {
      user = res.body.user;
      done(err);
    });
  });

  after((done) => {
    User.delete(user.id, done);
  });

  it('fails with blank email', function (done) {
    let data = {password: 'abc123', email: ''};
    app.post('/signin').send(data).end(function (err, res) {
      expect(res.body.reason).to.equal('EMAIL_REQUIRED');
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('fails with blank password', function (done) {
    let data = {email: 'signintest@test.com', password: ''};
    app.post('/signin').send(data).end(function (err, res) {
      expect(res.body.reason).to.equal('PASSWORD_REQUIRED');
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('fails with wrong password', function (done) {
    let data = {email: 'signintest@test.com', password: 'wrongpass'};
    app.post('/signin').send(data).end(function (err, res) {
      expect(res.body.reason).to.equal('WRONG_PASSWORD');
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('signs user in with correct credentials', function (done) {
    let data = {password: 'abc12345', email: 'signintest@test.com'};
    app.post('/signin').send(data).end(function (err, res) {
      expect(res.body.code).to.equal('OK');
      expect(res).to.have.cookie('userSession');
      expect(res.body.user.email).to.equal('signintest@test.com');
      expect(res.statusCode).to.equal(200);
      expect(res.body.user.id).to.exist;
      expect(res.body.user.password).to.not.exist;
      expect(res.body.user.confirmationToken).to.not.exist;
      // Session test
      app.get('/ping').end((err, res) => {
        expect(res.body.userId).to.equal(user.id);
        done();
      });
    });
  });

});
