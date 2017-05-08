'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;
const User = require('../lib/user');

describe('update', function () {

  const EMAIL = 'updateuser@test.com';
  const PASSWORD = 'abc123';

  it('404s on GET', function (done) {
    app.get('/update').end(function (err, res) {
      expect(res.body.code).to.equal('NOT_FOUND');
      expect(res.statusCode).to.equal(404);
      done();
    });
  });

  it('404s on POST', function (done) {
    app.post('/update').end(function (err, res) {
      expect(res.body.code).to.equal('NOT_FOUND');
      expect(res.statusCode).to.equal(404);
      done();
    });
  });

  it('404s on DELETE', function (done) {
    app.del('/update').end(function (err, res) {
      expect(res.body.code).to.equal('NOT_FOUND');
      expect(res.statusCode).to.equal(404);
      done();
    });
  });

  describe('without session', function () {

    it('returns unauthorized', function (done) {
      app.put('/update').send({username: 'user3'}).end(function (err, res) {
        expect(res.body.code).to.equal('UNAUTHORIZED');
        done();
      });
    });

  });

  describe('with session', function () {

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

    it('fails without userId', function (done) {
      let data = {username: 'user2'};
      app.put('/update').send(data).end(function (err, res) {
        expect(res.body.code).to.equal('BAD_REQUEST');
        expect(res.body.reason).to.equal('USERID_REQUIRED');
        done();
      });
    });

    it('works with blank password', function (done) {
      let data = {id: user.id, username: 'user2'};
      app.put('/update').send(data).end(function (err, res) {
        expect(res.body.code).to.equal('OK');
        expect(res.body.user.username).to.equal('user2');
        expect(res.body.user.email).to.equal(EMAIL);
        // Re-signin to make sure password wasn't affected
        app.post('/signin').send({email: EMAIL, password: PASSWORD}).end(function (err, res) {
          expect(res.body.code).to.equal('OK');
          expect(res.body.user.username).to.equal('user2');
          done();
        });
      });
    });

    it('changes password if present', function (done) {
      let data = {id: user.id, password: 'def456', username: 'user3'};
      app.put('/update').send(data).end(function (err, res) {
        expect(res.body.code).to.equal('OK');
        expect(res.body.user.username).to.equal('user3');
        app.post('/signin').send({email: EMAIL, password: 'def456'}).end(function (err, res) {
          expect(res.body.code).to.equal('OK');
          expect(res.body.user.username).to.equal('user3');
          // change it back
          data.password = PASSWORD;
          app.put('/update').send(data).end(function (err, res) {
            done(err);
          });
        });
      });
    });

  });

});

