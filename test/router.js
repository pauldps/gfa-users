'use strict';

const app = require('../support/test-app');
const expect = require('chai').expect;

describe('router', function () {

  it('fails with unsupported action', function (done) {
    let data = {action: 'test', data: {}};
    app.post('/all').send(data).end(function (err, res) {
      expect(res.statusCode).to.equal(400);
      expect(res.body.reason).to.equal('INVALID_ACTION');
      done();
    });
  });

});
