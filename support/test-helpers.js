'use strict';

const app = require('../support/test-app');
const User = require('../lib/user');
const password = require('../lib/password');

// Using underscore naming conventions here
//   just so they're more readable in tests.

module.exports = {
  create_entity,
  delete_all_users,
  delete_all_users_and_sign_out,
  sign_in_as_admin,
  sign_out
};

function create_entity (body, done) {
  password(body, (err, data) => {
    let entity = new User(data);
    entity.save((err, entity) => {
      if (err) return done(err);
      done(null, entity.plain());
    });
  });
}

function delete_all_users (done) {
  User.deleteAll(done);
}

function delete_all_users_and_sign_out (done) {
  delete_all_users((err) => {
    if (err) return done(err);
    sign_out(done);
  });
}

function sign_in_as_admin(done) {
  let body = {email: 'admin@test.com', password: 'adminpass', role: 'admin'};
  create_entity(body, (err, entity) => {
    if (err) return done(err);
    app.post('/signin').send(body).end((err, res) => {
      done(err, res.body.user);
    });
  });
}

function sign_out (done) {
  app.post('/signout').end(done);
}
