# google-function-auth (under development)

A simple user authentication and management system for [Google Cloud HTTP Functions](https://cloud.google.com/functions/docs/writing/http).

Dependencies:

* [Google Datastore](https://cloud.google.com/datastore/) to store user data (via [gstore-node](https://github.com/sebelga/gstore-node))
* [bcrypt](https://github.com/kelektiv/node.bcrypt.js) to hash passwords
* [client-session](https://github.com/mozilla/node-client-sessions) to manage sessions

## Basic Usage

Create a Google HTTP Function in your project that will provide an API for user authentication, authorization, and management:

```javascript
const GoogleFunctionAuth = require('google-function-auth');

exports.handleRequest = function (req, res) {
  GoogleFunctionAuth.handleAll(req, res);
};
```

Read more details about the `handleAll` method [here](#all-in-one).

## Project Roadmap

### 0.1.0

* First release.
* `handleAll`: global handler with `signin`, `create`, and `find` (one user) actions.
* `authorize`: handler to be used in your other Google Functions that require user authorization.
* Hardcoded validation.
* Hardcoded CORS support (allow all requests).

### TBA

In order of priority:

* Simplified role support.
* Support custom models (and validation).
* `update` action.
* `list` action (many users).
* `signout` action.
* `destroy` action.
* Email service support (Mailgun, SendGrid, etc) for sending various confirmation messages.
* In-memory caching support for `authorization`.
* Allow `authorization` caching to be customized/disabled.
* Allow CORS to be configured.
* Allow configuration of Datastore options, such as kind, namespace, and attribute names.
* Allow configuration of client-session options.
* Allow handlers to be called separately, allowing one Google Function to be created for each (good for monitoring).
* Support other data stores (like MySQL).
* Support other password hashing libraries.

## Usage

Refer to the Roadmap above to see which features are currently implemented.

### User Sign In

__Version__: TBA

First, create a Google Cloud HTTP Function that will serve as your authentication endpoint with the following content:

```javascript
const GoogleFunctionAuth = require('google-function-auth');

exports.handleRequest = function (req, res) {
  GoogleFunctionAuth.authenticate(req, res);
};
```

Assuming you named your function `signin`, the following endpoint will be available:

* `POST /signin` - signs an User in.

Upon successful login, the response will set a cookie in your browser, which is then sent alongside future requests and checked for authorization when applicable.

### User Management

__Version__: TBA

To manage users, create a Google Cloud HTTP Function that will serve as your user management endpoint with the following content:

```javascript
const GoogleFunctionAuth = require('google-function-auth');

exports.handleRequest = function (req, res) {
  GoogleFunctionAuth.manage(req, res);
};
```

Assuming you named your function `user`, the following endpoints will be available:

* `POST /user` - creates a new User in Datastore.
* `PUT|PATCH /user` - updates an User.
* `DELETE /user` - deletes an User.

### All-in-One

__Version__: 0.1.0, TBA

You can create a simple HTTP Function that does it all:

```javascript
const GoogleFunctionAuth = require('google-function-auth');

exports.handleRequest = function (req, res) {
  GoogleFunctionAuth.handleAll(req, res);
};
```

Using the global handler requires that a JSON string is sent in the request body containing an `action` attribute with the supported self-explanatory values:

* `signin` (as POST)
* `signout` (as POST) - TBA
* `create` (as POST)
* `update` (as PUT/PATCH) - TBA
* `delete` or `destroy` (as DELETE) - TBA
* `list` (as GET, many users) - TBA
* `find` (as GET, one user)

A `data` attribute is also required for each case, and must be an object with the following attributes:

* Sign In: `email` (or whatever is defined as the "username" attribute -- see Configuration) and `password`
* Create: all user attributes
* Update: all user attributes, plus `id`
* Delete: `id`
* List: `filters` (Array), `page` (optional, default 1), `limit` (items per page, optional, default 20)
* Find: `id`

If the request body is not in the format above, a `400 - Bad Request` will be returned.

### Authorization

__Version__: 0.1.0

Call `authorize` in your _other_ Google Functions to have the session cookie read from the request before calling your code:

```javascript
exports.handleRequest = function (req, res) {
  GoogleFunctionAuth.authorize(req, res, mainFunction);
};

function mainFunction (req, res, user) {
  // session is valid -- execute the rest of your function
}
```

If the session is invalid, a `401 - Unauthorized` error will be returned automatically. If you want to take control of error processing, pass a fourth argument to `authorize` with an error function that takes `req`, `res`, and `error` arguments.

### Roles

__Version:__ TBA

This library comes with a very simple role management system built-in.

Users with `admin` role are able to edit and delete other users.

Users with any other role are only allowed to edit or delete themselves. Self-deletion can be disabled in configuration.

Users cannot be created with a role, since that specific endpoint is public. Another user with `admin` role must edit newly created users if they need defined roles.

## Configuration

__Version:__ TBA

With the exception of `session.secret`, all other settings have the following defaults:

```javascript
const GoogleFunctionAuth = require('google-function-auth');

GoogleFunctionAuth.session.secret = 'MYSECRET';
GoogleFunctionAuth.session.expiration = 24 * 60 * 60 * 1000; // session expiration in ms
GoogleFunctionAuth.session.active = 1000 * 60 * 5; // session active duration in ms

GoogleFunctionAuth.datastore.kind = 'User';
GoogleFunctionAuth.datastore.namespace = null;
GoogleFunctionAuth.datastore.fields.username = 'username';
GoogleFunctionAuth.datastore.fields.email = 'email';
GoogleFunctionAuth.datastore.fields.password = 'password';
GoogleFunctionAuth.datastore.fields.role = 'role';

GoogleFunctionAuth.cors.allow = '*';
GoogleFunctionAuth.allowDeletion = true;

exports.handleRequest = function (req, res) {
  // ...
};
```

__Configuration must be the same across all functions__, so if you change any of the default values, make sure to replicate them accordingly.

_When Google Cloud Functions support environment variables, we will change this approach so all this copy/pasting can be avoided and configuration can be unified._

__This is a work in progress.__
