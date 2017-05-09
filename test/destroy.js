'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;
const helpers = require('../support/test-helpers');
const User = require('../lib/user');

const EMAIL = 'destroyuser@test.com';
const PASSWORD = 'xyz987';

describe('destroy', function () {

  let user;

  after(function (done) {
    helpers.delete_all_users_and_sign_out(done);
  });

  describe('without session', function () {

    it('returns unauthorized', function (done) {
      app.del('/users/1').end(function (err, res) {
        expect(res.body.code).to.equal('UNAUTHORIZED');
        expect(res.statusCode).to.equal(401);
        done();
      });
    });

  });

  describe('with session', function () {

    before(function (done) {
      let data = {email: EMAIL, password: PASSWORD, username: 'user1'}
      helpers.create_user_and_sign_in(data, (err, entity) => {
        if (err) return done(err);
        user = entity;
        done();
      });
    });

    after(function (done) {
      helpers.delete_all_users_and_sign_out(done);
    });

    it('fails if userId sent is different from signed-in, non-admin user', function (done) {
      app.del('/users/anotherid').end(function (err, res) {
        expect(res.body.code).to.equal('FORBIDDEN');
        done();
      });
    });

    it('deletes user and resets session if userId sent matches with signed-in user', function (done) {
      app.del(`/users/${user.id}`).end(function (err, res) {
        expect(res.body.code).to.equal('OK');
        app.get(`/users/${user.id}`).end(function (err, res) {
          expect(res.body.code).to.equal('UNAUTHORIZED'); // not logged in
          app.post('/users/signin').send({email: EMAIL, password: PASSWORD}).end(function (err, res) {
            expect(res.body.code).to.equal('NOT_FOUND');
            done();
          });
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

      it('does not reset session when deleting a different user', function (done) {
        let dummy = {email: 'tobedeleted@test.com', username: 'tobedeleted', password: '123'};
        helpers.create_entity(dummy, (err, entity) => {
          if (err) return done(err);
          app.del(`/users/${entity.id}`).end((err, res) => {
            expect(res.body.code).to.equal('OK');
            app.get(`/users/${admin.id}`).end((err, res) => {
              expect(res.body.code).to.equal('OK');
              done();
            });
          });
        });
      });

      it('returns 404 if userId does not exist', function (done) {
        // user.id has been deleted by a previous test
        app.del(`/users/${user.id}`).end(function (err, res) {
          expect(res.body.code).to.equal('NOT_FOUND');
          done();
        });
      });

    });

  });

});
