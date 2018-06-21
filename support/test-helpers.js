/* eslint-disable camelcase */
// Using underscore naming conventions here
//   just so they're more readable in tests.

'use strict'

const app = require('../support/test-app')
const User = require('../lib/user')
const password = require('../lib/password')

module.exports = {
  create_entity,
  create_many_users,
  create_user_and_sign_in,
  delete_all_users,
  delete_all_users_and_sign_out,
  sign_in,
  sign_in_as_admin,
  sign_out,
  sign_out_and_delete_user
}

function create_entity (body, done) {
  password(body, (err, data) => {
    let entity = new User(data)
    entity.save((err, entity) => {
      if (err) return done(err)
      done(null, entity.plain())
    })
  })
}

function create_many_users (quantity, done) {
  var i, data, remaining = quantity
  for (i = 0; i < quantity; ++i) {
    data = {username: `user${i}`, email: `teste${i}@test.com`, password: 'abc123'}
    create_entity(data, (err, entity) => {
      remaining--
      if (remaining === 0) {
        done()
      }
    })
  }
}

function create_user_and_sign_in (data, done) {
  create_entity(data, (err, entity) => {
    if (err) return done(err)
    sign_in(data.email, data.password, done)
  })
}

function delete_all_users (done) {
  User.deleteAll(done)
}

function delete_all_users_and_sign_out (done) {
  delete_all_users((err) => {
    if (err) return done(err)
    sign_out(done)
  })
}

function sign_in (email, password, done) {
  app.post('/users/signin').send({email, password}).end((err, res) => {
    done(err, res.body.user)
  })
}

function sign_in_as_admin (done) {
  let body = {email: 'admin@test.com', password: 'adminpass', role: 'admin'}
  create_user_and_sign_in(body, done)
}

function sign_out (done) {
  app.post('/users/signout').end(done)
}

function sign_out_and_delete_user (userId, done) {
  sign_out((err) => {
    if (err) return done(err)
    User.delete(userId, done)
  })
}
