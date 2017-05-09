'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;
const helpers = require('../support/test-helpers');
const User = require('../lib/user');

const EMAIL = 'finduser@test.com';
const PASSWORD = 'abc987';

describe('find', function () {

  after(function (done) {
    helpers.delete_all_users_and_sign_out(done);
  });

  describe('without session', function () {

    it('returns unauthorized', function (done) {
      app.get('/users/1').end(function (err, res) {
        expect(res.body.code).to.equal('UNAUTHORIZED');
        expect(res.statusCode).to.equal(401);
        done();
      });
    });

  });

  describe('with session', function () {

    let user;

    describe('as non-admin', function () {

      before(function (done) {
        let data = {email: EMAIL, password: PASSWORD, username: 'user1'}
        helpers.create_user_and_sign_in(data, (err, entity) => {
          user = entity;
          done(err);
        });
      });

      it('is forbidden if ID requested is different from signed-in user', function (done) {
        app.get('/users/anotherid').end(function (err, res) {
          expect(res.body.code).to.equal('FORBIDDEN');
          done();
        });
      });

      it('returns user data if ID matches signed-in user', function (done) {
        app.get(`/users/${user.id}`).end(function (err, res) {
          expect(res.body.code).to.equal('OK');
          done();
        });
      });

    });

    describe('as admin', function () {

      let admin;

      before(function (done) {
        helpers.sign_in_as_admin((err, entity) => {
          admin = entity;
          done(err);
        });
      });

      it('returns 404 if user does not exist', function (done) {
        app.get('/users/idonotexist').end(function (err, res) {
          expect(res.body.code).to.equal('NOT_FOUND');
          done();
        });
      });

      it('returns user data from any ID', function (done) {
        app.get(`/users/${user.id}`).end(function (err, res) {
          expect(res.body.code).to.equal('OK');
          done();
        });
      });

    });

  });

});
