'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;
const helpers = require('../support/test-helpers');
const User = require('../lib/user');

describe('update', function () {

  const EMAIL = 'updateuser@test.com';
  const PASSWORD = 'abc123';

  describe('without session', function () {

    it('returns unauthorized', function (done) {
      app.put('/users/1').send({username: 'user3'}).end(function (err, res) {
        expect(res.body.code).to.equal('UNAUTHORIZED');
        done();
      });
    });

  });

  describe('with session', function () {

    let user;

    before(function (done) {
      let data = {email: EMAIL, password: PASSWORD, username: 'user1'}
      helpers.create_user_and_sign_in(data, (err, entity) => {
        user = entity;
        done(err);
      });
    });

    after(function (done) {
      helpers.delete_all_users_and_sign_out(done);
    });

    it('validates input', function (done) {
      app.put(`/users/${user.id}`).send({email: 'invalidemail'}).end(function (err, res) {
        expect(res.body.code).to.equal('BAD_REQUEST');
        done();
      });
    });

    it('cannot edit another user', function (done) {
      app.put(`/users/1`).send({email: 'otheraccount@test.com'}).end(function (err, res) {
        expect(res.body.code).to.equal('FORBIDDEN');
        done();
      });
    });

    it('works with blank password', function (done) {
      let data = {username: 'user2', role: 'hacker'};
      app.put(`/users/${user.id}`).send(data).end(function (err, res) {
        expect(res.body.code).to.equal('OK');
        expect(res.body.user.username).to.equal('user2');
        expect(res.body.user.email).to.equal(EMAIL);
        expect(res.body.user.role).to.not.equal('hacker');
        // Re-signin to make sure password wasn't affected
        app.post('/users/signin').send({email: EMAIL, password: PASSWORD}).end(function (err, res) {
          expect(res.body.code).to.equal('OK');
          expect(res.body.user.username).to.equal('user2');
          expect(res.body.user.role).to.not.equal('hacker');
          done();
        });
      });
    });

    it('changes password if present', function (done) {
      let data = {password: 'def456', username: 'user3'};
      app.put(`/users/${user.id}`).send(data).end(function (err, res) {
        expect(res.body.code).to.equal('OK');
        expect(res.body.user.username).to.equal('user3');
        app.post('/users/signin').send({email: EMAIL, password: 'def456'}).end(function (err, res) {
          expect(res.body.code).to.equal('OK');
          expect(res.body.user.username).to.equal('user3');
          // change it back
          data.password = PASSWORD;
          app.put(`/users/${user.id}`).send(data).end(function (err, res) {
            done(err);
          });
        });
      });
    });

    describe('as admin', function () {

      before(function (done) {
        helpers.sign_in_as_admin(done);
      });

      it('can edit any user, including role', function (done) {
        let data = {username: 'changedbyadmin', role: 'editor'};
        app.put(`/users/${user.id}`).send(data).end(function (err, res) {
          expect(res.body.code).to.equal('OK');
          expect(res.body.user.username).to.equal('changedbyadmin');
          expect(res.body.user.role).to.equal('editor');
          app.get(`/users/${user.id}`).end(function (err, res) {
            expect(res.body.code).to.equal('OK');
            expect(res.body.user.username).to.equal('changedbyadmin');
            expect(res.body.user.role).to.equal('editor');
            done();
          });
        });
      });

    });

  });

});
