'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;
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
      app.post('/create').send(data).end(function (err, res) {
        if (err) {
          return done(err);
        }
        // Starts session
        app.post('/signin').send({email: EMAIL, password: PASSWORD}).end(function (err, res) {
          if (err) {
            return done(err);
          }
          user = res.body.user;
          done();
        });
      });
    });

    after(function (done) {
      app.del('/signout').end(function (err) {
        if (err) {
          return done(err);
        }
        User.delete(user.id, done);
      });
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
