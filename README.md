# google-function-auth (under development)

A simple User authentication and management system for Google Cloud HTTP Functions.

It uses Google Datastore to store User information, Bcrypt to manage passwords, and JSON Web Tokens for endpoint authorization.

## User Sign In

First, create a Google Cloud HTTP Function that will serve as your authentication endpoint with the following content:

```javascript
const UserHandler = require('google-function-auth');

exports.handleRequest = function (req, res) {
  UserHandler.authenticate(req, res);
};
```

Assuming you named your function `signin`, the following endpoint will be available:

* `POST /signin` - signs in an User and returns a JSON Web Token.

## User Management

To manage users, create a Google Cloud HTTP Function that will serve as your user management endpoint with the following content:

```javascript
const UserHandler = require('google-function-auth');

exports.handleRequest = function (req, res) {
  UserHandler.manage(req, res);
};
```

Assuming you named your function `user`, the following endpoints will be available:

* `POST /user` - creates a new User in Datastore.
* `PUT|PATCH /user` - updates an User. Requires Authorization header with JWT.
* `DELETE /user` - deletes an User. Requires Authorization header with JWT.

## All-in-One

You can create a simple HTTP Function that does it all:

```javascript
const UserHandler = require('google-function-auth');

exports.handleRequest = function (req, res) {
  UserHandler.handle(req, res);
};
```

Using the global handler requires that a JSON string is sent in the request body containing an `action` attribute with the supported self-explanatory values:

* `signin` (as POST)
* `create` (as POST)
* `update` (as PUT/PATCH)
* `delete` (as DELETE)

Alongside the `action` attribute, a `data` attribute is required for each case containing a object with the following attributes:

* Sign In: `email` (or whatever was defined as the "username" attribute -- see Configuration) and `password`
* Create: all user attributes
* Update: all user attributes, plus `id`
* Delete: `id`

If the request body is not in the format above, a `400 - Bad Request` will be returned.

## Authorization

Call `authorize` in your _other_ Google Functions to have the JWT read from the __Authorization__ header and its User validated/retrieved before calling your code:

```javascript
// ... 
const UserHandler = require('google-function-auth');

exports.handleRequest = function (req, res) {
  UserHandler.authorize(req, res, mainFunction);
};

function mainFunction (req, res, user) {
  // token is valid -- execute the rest of your function
}

```

If the token is invalid, a `401 - Unauthorized` error will be returned automatically. If you want to take control of error processing, pass a fourth argument to `authorize` with an error function that takes `req`, `res`, and `error` arguments.

## Roles

This module comes with a very simple role management system built-in.

Users with `admin` role are able to edit and delete other users.

Users with any other role are only allowed to edit or delete themselves. (Deletion can be disabled in configuration.)

Users cannot be created with a role, since that specific endpoint is public. Another `admin` must edit newly created Users if they need defined roles.

## Configuration

With the exception of `jwt.secret`, all other settings have the following defaults:

```javascript
const UserHandler = require('google-function-auth');

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

__Configuration must be the same across all functions__, so if you change any of the default values, make sure to replicate them accordingly.

_When Google Cloud Functions support environment variables, we will change this approach so all this copy/pasting can be avoided and configuration can be unified._

__This is a work in progress.__
