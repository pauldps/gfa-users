'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;
const helpers = require('../support/test-helpers');
const User = require('../lib/user');

const EMAIL = 'destroyuser@test.com';
const PASSWORD = 'xyz987';

describe('destroy', function () {

  after(function (done) {
    helpers.delete_all_users_and_sign_out(done);
  });

  it('404s on GET', function (done) {
    app.get('/destroy').end(function (err, res) {
      expect(res.body.code).to.equal('NOT_FOUND');
      expect(res.statusCode).to.equal(404);
      done();
    });
  });

  it('404s on POST', function (done) {
    app.post('/destroy').end(function (err, res) {
      expect(res.body.code).to.equal('NOT_FOUND');
      expect(res.statusCode).to.equal(404);
      done();
    });
  });

  it('404s on PUT', function (done) {
    app.put('/destroy').end(function (err, res) {
      expect(res.body.code).to.equal('NOT_FOUND');
      expect(res.statusCode).to.equal(404);
      done();
    });
  });

  it('404s on PATCH', function (done) {
    app.patch('/destroy').end(function (err, res) {
      expect(res.body.code).to.equal('NOT_FOUND');
      expect(res.statusCode).to.equal(404);
      done();
    });
  });

  describe('without session', function () {

    it('returns unauthorized', function (done) {
      app.del('/destroy').end(function (err, res) {
        expect(res.body.code).to.equal('UNAUTHORIZED');
        expect(res.statusCode).to.equal(401);
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
      app.post('/signout').end(function (err) {
        if (err) {
          return done(err);
        }
        User.delete(user.id, done);
      });
    });

    it('fails without userId', function (done) {
      let data = {a: 'b'};
      app.del('/destroy').query(data).end(function (err, res) {
        expect(res.body.code).to.equal('BAD_REQUEST');
        expect(res.body.reason).to.equal('USERID_REQUIRED');
        done();
      });
    });

    it('fails if userId sent is different from signed-in, non-admin user', function (done) {
      let data = {userId: 'IDONOTEXIST'};
      app.del('/destroy').query(data).end(function (err, res) {
        expect(res.body.code).to.equal('FORBIDDEN');
        done();
      });
    });

    it('deletes user and resets session if userId sent matches with signed-in, non-admin user', function (done) {
      let data = {userId: user.id};
      app.del('/destroy').query(data).end(function (err, res) {
        expect(res.body.code).to.equal('OK');
        app.get('/ping').end(function (err, res) {
          expect(res.body.code).to.equal('OK');
          expect(res.body.user).to.not.exist;
          app.post('/signin').send({email: EMAIL, password: PASSWORD}).end(function (err, res) {
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

      it('does not reset session when deleting another user', function (done) {
        let dummy = {email: 'tobedeleted@test.com', username: 'tobedeleted', password: '123'};
        helpers.create_entity(dummy, (err, entity) => {
          if (err) return done(err);
          app.del('/destroy').query({userId: entity.id}).end((err, res) => {
            expect(res.body.code).to.equal('OK');
            app.get('/ping').end((err, res) => {
              expect(res.body.userId).to.equal(admin.id);
              done();
            });
          });
        });
      });

      it('returns 404 if userId does not exist', function (done) {
        let data = {userId: user.id}; // this user has been deleted by a previous test
        app.del('/destroy').query(data).end(function (err, res) {
          expect(res.body.code).to.equal('NOT_FOUND');
          done();
        });
      });

    });

  });

});
