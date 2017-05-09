'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;
const helpers = require('../support/test-helpers');
const User = require('../lib/user');

describe('authorize', function () {

  describe('without session', function () {

    it('returns unauthorized', function (done) {
      app.get('/authorized-function').end(function (err, res) {
        expect(res.body.code).to.equal('UNAUTHORIZED');
        done();
      });
    });

    it('returns unauthorized with custom error', function (done) {
      app.get('/authorized-function-with-error').end(function (err, res) {
        expect(res.statusCode).to.equal(404);
        expect(res.body.code).to.equal('UNAUTHORIZED');
        expect(res.body.message).to.equal('Pretend I do not exist');
        done();
      });
    });

  });

  describe('with session', function () {

    const EMAIL = 'authorized@test.com';
    const PASSWORD = 'abc123';
    let user;

    before(function (done) {
      let data = {email: EMAIL, password: PASSWORD, username: 'user1'}
      helpers.create_user_and_sign_in(data, done);
    });

    after(function (done) {
      helpers.delete_all_users_and_sign_out(done);
    });

    it('raises an error if next() function is not specified', function () {
      app.get('/authorized-function-without-next').end(function (err, res) {
        expect(res.body.code).to.equal('INTERNAL_ERROR');
        done();
      });
    });

    it('executes next function if user is authorized', function () {
      app.get('/authorized-function').end(function (err, res) {
        expect(res.body.userId).to.equal(user.id);
        expect(res.body.email).to.equal(EMAIL);
        done();
      });
    });

  });

});
