const expect = require('chai').expect
const Users = require('../')
const { createApp, deleteApp } = require('@gfa/firestore-adapter/config/firestore')

const defaults = {
  session: { secret: 'test' }
}

describe('Users', function () {
  before(function () {
    createApp()
  })

  after(function () {
    deleteApp()
  })

  describe('constructor', function () {
    it('sets correct defaults', function () {
      var app = new Users(defaults)
      expect(app.table).to.equal('Users')
    })
  })
})
