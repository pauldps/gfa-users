'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;

describe('middleware', function () {

  it('returns 404 on PUT without ID', function (done) {
    app.put('/users').end(function (err, res) {
      expect(res.body.code).to.equal('NOT_FOUND');
      done();
    });
  });

  it('returns 404 on PUT without ID and trailing slashes', function (done) {
    app.put('/users/').end(function (err, res) {
      expect(res.body.code).to.equal('NOT_FOUND');
      app.put('/users///').end(function (err, res) {
        expect(res.body.code).to.equal('NOT_FOUND');
        done();
      });
    });
  });

  it('returns 404 on DELETE without ID', function (done) {
    app.del('/users').end(function (err, res) {
      expect(res.body.code).to.equal('NOT_FOUND');
      done();
    });
  });

  it('returns 404 on DELETE without ID and trailing slashes', function (done) {
    app.del('/users/').end(function (err, res) {
      expect(res.body.code).to.equal('NOT_FOUND');
      app.del('/users///').end(function (err, res) {
        expect(res.body.code).to.equal('NOT_FOUND');
        done();
      });
    });
  });

});
