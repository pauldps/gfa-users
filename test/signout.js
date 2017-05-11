'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;
const helpers = require('../support/test-helpers');

describe('signout', function () {

  let user;

  beforeEach(function (done) {
    let data = {email: 'signintest@test.com', password: 'abc12345'};
    helpers.create_user_and_sign_in(data, (err, entity) => {
      user = entity;
      done(err);
    });
  });

  after(function (done) {
    helpers.delete_all_users_and_sign_out(done);
  });

  it('signs user out', function (done) {
    app.get(`/users/${user.id}`).end(function (err, res) {
      expect(res.body.user.id).to.equal(user.id);
      app.post('/users/signout').end(function (err, res) {
        expect(res.body.code).to.equal('OK');
        app.get(`/users/${user.id}`).end(function (err, res) {
          expect(res.body.code).to.equal('UNAUTHORIZED');
          done();
        });
      });
    });
  });

  it('also works with DELETE /users/signin', function (done) {
    app.get(`/users/${user.id}`).end(function (err, res) {
      expect(res.body.user.id).to.equal(user.id);
      app.del('/users/signin').end(function (err, res) {
        expect(res.body.code).to.equal('OK');
        app.get(`/users/${user.id}`).end(function (err, res) {
          expect(res.body.code).to.equal('UNAUTHORIZED');
          done();
        });
      });
    });
  });

});
