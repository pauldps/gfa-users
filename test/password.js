'use strict';

const password = require('../lib/password');
const expect = require('chai').expect;
const Bcrypt = require('bcrypt');

describe('password', function () {

  let body = {};

  it('returns error on blank password', function (done) {
    body.password = '';
    password(body, (err, data) => {
      expect(err).to.equal('EMPTY_PASSWORD');
      done();
    });
  });

  it('sets hashed password in returned object', function (done) {
    body.password = 'abc123';
    password(body, (err, data) => {
      expect(data.password).to.not.equal(body.password);
      expect(err).to.not.exist;
      Bcrypt.compare(body.password, data.password, (err, valid) => {
        expect(valid).to.equal(true);
        expect(err).to.not.exist;
        done();
      });
    });
  });

});
