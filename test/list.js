'use strict'

const app = require('../support/test-app')
const expect = require('chai').expect
const helpers = require('../support/test-helpers')
const User = require('../lib/user')

const EMAIL = 'listuser@test.com'
const PASSWORD = 'xxx666'

describe('list', function () {
  after(function (done) {
    helpers.delete_all_users_and_sign_out(done)
  })

  describe('without session', function () {
    before(function (done) {
      helpers.sign_out(done)
    })

    it('returns unauthorized', function (done) {
      app.get('/users').end(function (err, res) {
        expect(res.body.code).to.equal('UNAUTHORIZED')
        done()
      })
    })
  })

  describe('with session', function () {
    this.timeout(10000)

    describe('as non-admin', function () {
      let user

      before(function (done) {
        let data = {email: EMAIL, password: PASSWORD, username: 'user1'}
        helpers.create_user_and_sign_in(data, done)
      })

      after(function (done) {
        helpers.delete_all_users_and_sign_out(done)
      })

      it('returns forbidden', function (done) {
        app.get('/users').end(function (err, res) {
          expect(res.body.code).to.equal('FORBIDDEN')
          done()
        })
      })
    })

    describe('as admin', function () {
      let admin
      let start

      before(function (done) {
        helpers.sign_in_as_admin((err, entity) => {
          admin = entity
          done(err)
        })
      })

      before(function (done) {
        helpers.create_many_users(29, done)
      })

      it('returns a list of users with default settings', function (done) {
        app.get('/users').end(function (err, res) {
          expect(res.body.code).to.equal('OK')
          expect(res.body.items.length).to.equal(20)
          expect(res.body.next).to.exist
          done()
        })
      })

      it('returns a list of users with limit', function (done) {
        app.get('/users').query({limit: 15}).end(function (err, res) {
          expect(res.body.code).to.equal('OK')
          expect(res.body.items.length).to.equal(15)
          expect(res.body.next).to.exist
          done()
        })
      })

      it('returns a list of users with start', function (done) {
        app.get('/users').query({limit: 19}).end(function (err, res) {
          expect(res.body.next).to.exist
          start = res.body.next
          app.get('/users').query({start}).end(function (err, res) {
            expect(res.body.code).to.equal('OK')
            expect(res.body.items.length).to.equal(11)
            done()
          })
        })
      })

      it('sets limit to 20 on invalid values', function (done) {
        app.get('/users').query({limit: -1}).end(function (err, res) {
          expect(res.body.code).to.equal('OK')
          expect(res.body.limit).to.equal(20)
          app.get('/users').query({limit: 99999}).end(function (err, res) {
            expect(res.body.code).to.equal('OK')
            expect(res.body.limit).to.equal(20)
            done()
          })
        })
      })
    })
  })
})
