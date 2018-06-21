'use strict'

const app = require('../support/test-app')
const expect = require('chai').expect

describe('cors', function () {
  it('returns proper header', function (done) {
    app.options('/users').end(function (err, res) {
      expect(res.statusCode).to.equal(200)
      expect(res.headers['access-control-allow-origin']).to.equal('*')
      done()
    })
  })
})
