'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;
const User = require('../lib/user');

describe('GoogleFunctionAuth', function () {

  describe('create', function () {

    it('fails with blank password', function (done) {
      let data = {password: ''};
      app.post('/create').send(data).end(function (err, res) {
        expect(res.body.reason).to.equal('EMPTY_PASSWORD');
        expect(res.statusCode).to.equal(400);
        done();
      });
    });

    it('fails with blank email', function (done) {
      let data = {password: 'abc123', email: ''};
      app.post('/create').send(data).end(function (err, res) {
        expect(res.statusCode).to.equal(400);
        done();
      });
    });

    it('creates user with email and password and returns sanitized user', function (done) {
      let data = {password: 'abc123', email: 'abc@test.com'};
      app.post('/create').send(data).end(function (err, res) {
        expect(res.body.code).to.equal('OK');
        expect(res.body.user.email).to.equal('abc@test.com');
        expect(res.statusCode).to.equal(200);
        expect(res.body.user.id).to.exist;
        expect(res.body.user.password).to.not.exist;
        expect(res.body.user.confirmationToken).to.not.exist;
        _cleanup(res.body.user.id, done);
      });
    });

  });

});

function _cleanup (userId, callback) {
  User.delete(userId, callback);
}
