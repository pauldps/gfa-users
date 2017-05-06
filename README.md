# google-function-authorizer

__(Currently under development)__

A simple user authentication and management system for [Google Cloud HTTP Functions](https://cloud.google.com/functions/docs/writing/http).

Dependencies:

* [Google Datastore](https://cloud.google.com/datastore/) to store user data (via [gstore-node](https://github.com/sebelga/gstore-node))
* [bcrypt](https://github.com/kelektiv/node.bcrypt.js) to hash passwords
* [client-session](https://github.com/mozilla/node-client-sessions) to manage sessions

## Basic Usage

Create a Google HTTP Function in your project that will provide an API for user authentication, authorization, and management:

```javascript
const authorizer = require('google-function-authorizer');

exports.handleRequest = function (req, res) {
  authorizer.all(req, res);
};
```

Read more details about the `all` method [here](#all-in-one).

## Project Roadmap

### 0.1.0

* First release.
* `all`: global handler with `signin`, `create`, `find` (one user), and `ping` actions.
* `authorize`: handler to be used in your other Google Functions that require user authorization.
* `create` action.
* `signin` action.
* `signout` action.
* `ping` action.
* Hardcoded model/validation.
* Hardcoded CORS support (allow all requests).

### TBA

In order of priority:

* Simplified role support.
* Support custom models and validation.
* `update` action.
* `list` action (many users).
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

__Refer to the Roadmap above to see which features are currently implemented.__

### User Sign In

__Version__: TBA

You can create a Google Cloud HTTP Function that will serve as your authentication endpoint with the following content:

```javascript
const authorizer = require('google-function-authorizer');

exports.handleRequest = function (req, res) {
  authorizer.signin(req, res);
};
```

Assuming you named your function `signin`, the following endpoint will be available:

* `POST /signin` - signs an user in.
* `DELETE /signin` - signs an user out.

Upon successful login, the response will set a cookie in your browser, which is then sent alongside future requests and checked for authorization when applicable.

### User Management

__Version__: TBA

To manage users, create a Google Cloud HTTP Function that will serve as your user management endpoint with the following content:

```javascript
const authorizer = require('google-function-authorizer');

exports.handleRequest = function (req, res) {
  authorizer.manage(req, res);
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
const authorizer = require('google-function-authorizer');

exports.handleRequest = function (req, res) {
  authorizer.all(req, res);
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
* `ping` (as GET, health check and session data)

A `data` (for POST, PUT, and PATCH) or `query` (for GET and DELETE) attribute is also required in most cases and must be an object with the following attributes:

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
  authorizer.authorize(req, res, mainFunction);
};

function mainFunction (req, res, user) {
  // session is valid -- execute the rest of your function
}
```

If the session is valid, a `user` object will be passed along to your main function, containing a subset of stored attributes.

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
const authorizer = require('google-function-authorizer');

authorizer.session.secret = 'MYSECRET';
authorizer.session.expiration = 24 * 60 * 60 * 1000; // session expiration in ms
authorizer.session.active = 1000 * 60 * 5; // session active duration in ms

authorizer.datastore.kind = 'User';
authorizer.datastore.namespace = null;
authorizer.datastore.fields.username = 'username';
authorizer.datastore.fields.email = 'email';
authorizer.datastore.fields.password = 'password';
authorizer.datastore.fields.role = 'role';

authorizer.cors.allow = '*';
authorizer.allowDeletion = true;

exports.handleRequest = function (req, res) {
  // ...
};
```

__Configuration must be the same across all functions__, so if you change any of the default values, make sure to replicate them accordingly.

_When Google Cloud Functions support environment variables, we will change this approach so all this copy/pasting can be avoided and configuration can be unified._

__This is a work in progress.__
