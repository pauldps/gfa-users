# google-http-function-datastore-users (under development)

User authentication and management for Google Cloud HTTP Functions with Datastore.

## Purpose

This is intended to be used by Google Cloud Functions that are fired by HTTP Triggers.

It uses Google Datastore to store User information, Bcrypt to manage passwords, and JSON Web Tokens for endpoint authentication.

## User Sign In

First, create a Google Cloud HTTP Function that will serve as your authentication endpoint with the following content:

```javascript
const UserHandler = require('google-http-function-datastore-users');

exports.handleRequest = function (req, res) {
  UserHandler.authenticate(req, res);
};
```

Assuming you named your function `signin`, the following endpoint will be available:

* `POST /signin` - creates a new session, signing in an User and returning a Json Web Token.

## User Management

To manage users, create a Google Cloud HTTP Function that will serve as your user management endpoint with the following content:

```javascript
const UserHandler = require('google-http-function-datastore-users');

exports.handleRequest = function (req, res) {
  UserHandler.manage(req, res);
};
```

Assuming you named your function `user`, the following endpoints will be available:

* `POST /user` - creates a new User in Datastore.
* `PUT|PATCH /user` - updates an User. Requires Authorization header with JWT.
* `DELETE /user` - deletes an User. Requires Authorization header with JWT.

### Roles

This module comes with a very simple role management built-in.

Users with `admin` role are able to edit and delete other users.

Users with any other role are only allowed to edit or delete themselves. (Deletion can be disabled in configuration.)

Users cannot be created with a role, since that specific endpoint is public. Another `admin` User must edit newly created Users if they need defined roles.

## Configuration

With the exception of `jwt.secret`, all other settings have the following defaults:

```javascript
const UserHandler = require('google-http-function-datastore-users');

UserHandler.jwt.secret = 'MYSECRET';
UserHandler.jwt.expiration = 86400; // token expiration in seconds

UserHandler.datastore.kind = 'User';
UserHandler.datastore.namespace = null;
UserHandler.datastore.fields.username = 'username';
UserHandler.datastore.fields.email = 'email';
UserHandler.datastore.fields.password = 'password';
UserHandler.datastore.fields.role = 'role';

UserHandler.cors.allow = '*';
UserHandler.allowDeletion = true;

exports.handleRequest = function (req, res) {
  // ...
};

```

This is a work in progress.
