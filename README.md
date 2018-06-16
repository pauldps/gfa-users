# google-function-authorizer

[![Build Status](https://semaphoreci.com/api/v1/pauloddr/google-function-authorizer/branches/master/shields_badge.svg)](https://semaphoreci.com/pauloddr/google-function-authorizer)
[![Test Coverage](https://lima.codeclimate.com/github/pauloddr/google-function-authorizer/badges/coverage.svg)](https://lima.codeclimate.com/github/pauloddr/google-function-authorizer/coverage)
[![Code Climate](https://lima.codeclimate.com/github/pauloddr/google-function-authorizer/badges/gpa.svg)](https://lima.codeclimate.com/github/pauloddr/google-function-authorizer)
[![npm version](https://badge.fury.io/js/google-function-authorizer.svg)](https://badge.fury.io/js/google-function-authorizer)

A simple user authentication system for [Google Cloud HTTP Functions](https://cloud.google.com/functions/docs/writing/http).

It stores user data in [Google Datastore](https://cloud.google.com/datastore/) using [gstore-node](https://github.com/sebelga/gstore-node); hashes passwords with [bcrypt](https://github.com/kelektiv/node.bcrypt.js); and manages browser sessions with [client-session](https://github.com/mozilla/node-client-sessions).

## Usage

Create a new Google HTTP Function with the following code:

```javascript
const Authorizer = require('google-function-authorizer')
const authorizer = new Authorizer()

authorizer.secret = 'MYSECRETKEY' // must be set!

exports.handleRequest = function (req, res) {
  authorizer.handle(req, res)
}
```

Add the library to __package.json__:

```json
{
  "name": "your-function",
  "version": "0.0.1",
  "dependencies": {
    "google-function-authorizer": "0.1.0"
  }
}
```

Finally, make sure the __entry point__ is correct. In the example above, it should be `handleRequest`.

Then, assuming you named your function "session", the following endpoints will be served by your function:

* `POST /session` - creates a new session (user sign-in)
* `GET /session` - returns information about current session
* `HEAD /session` - returns statusCode 200 if there's an ongoing session, 401 otherwise
* `DELETE /session` - destroys session (user sign-out)
* `OPTIONS /session` - returns headers

Read more about how each endpoint works in the next section.

### User Sign-in

* `POST /session`

This endpoint creates a new session if provided credentials are valid.

<table>
<tr><th>Request Body</th><th>Response</th></tr>
<tr><td>

```javascript
// valid credentials
{
  "email": "myemail@test.com",
  "password": "abc123"
}
```

</td><td>

```javascript
// statusCode: 200
{
  "id": "12345",
  "username": "MyUsername"
}
```

</td></tr>

<tr><td>

```javascript
// invalid credentials
{
  "email": "myemail@test.com",
  "password": "wrongpass"
}
```

</td><td>

```javascript
// statusCode: 401 Unauthorized
// empty response
```

</td></tr>

</table>

### User Sign-out

* `DELETE /session`

Signs a user out, removing the session cookie.

<table>
<tr><th>Request Body</th><th>Response</th></tr>
<tr><td>(empty)</td><td>

```
// statusCode 204
// empty response
```

</td></tr>
</table>



### Preflight Requests

* `OPTIONS /session`

Some clients will fire a "preflight request" prior to making the real request to verify CORS options, which are supported by this library.

<table>
<tr><th>Request Body</th><th>Response</th></tr>
<tr><td>(empty)</td><td>

```javascript
// statusCode 204
// empty response with CORS and other security headers
```

</td></tr>
</table>

## Authorization

Call `authorize` in your _other_ Google Functions to have the session cookie read from the request before calling your code:

```javascript
const Authorizer = require('google-function-authorizer')
const authorizer = new Authorizer()

authorizer.secret = 'MYSECRETKEY' // required! must be the same as your "session" function

exports.handleRequest = function (req, res) {
  authorizer.authorize(req, res, mainFunction);
};

function mainFunction (req, res, user) {
  // session cookie is valid -- execute the rest of your function
}
```

If the session is valid, a `user` object will be passed along to your main function, containing a subset of stored attributes.

If the session is invalid, a `401 - Unauthorized` error will be returned automatically, and your main function won't be called. If you want to take control of error processing, pass a fourth argument to `authorize` with an error function that takes `req` and `res` arguments.

## Configuration

Settings can be customized after creating an instance and have the following defaults:

```javascript
authorizer.secret = null // REQUIRED! when not set, function will crash

authorizer.session.name = 'userSession' // cookie name
authorizer.session.duration = 24 * 60 * 60 * 1000, // session expiration in ms
authorizer.session.activeDuration = activeDuration: 1000 * 60 * 5 // session active duration in ms

authorizer.database.table = 'User' // Datastore "Kind"
authorizer.database.namespace = null // Datastore namespace

authorizer.database.fields.primary = 'username' // name of the field used together with password during sign-in
authorizer.database.fields.password = 'password' // name of the field that stores the password

authorizer.headers.push(['Access-Control-Allow-Origin', '*']) // array of headers sent in all responses
```

Please note that __settings must be the same across all functions__. So if you change any of the default values, make sure to replicate them accordingly.

Google Cloud Functions do not support environment variables at this time. Whenever it does, this library will be updated to use them, to avoid the copy/paste of settings.

## TODO/Wishlist

* Google reCAPTCHA support on user sign-in.
* Email service support (Mailgun, SendGrid, etc) for sending various confirmation messages.
* Support other data stores (like MySQL).

## License

MIT
