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
* `DELETE /session` - destroys session (user sign-out)
* `OPTIONS /session` - returns headers

Read more about how each endpoint works in the next section.

### User Sign-in

* `POST /session`

This endpoint creates a new session if provided credentials are valid.

Successful responses set a cookie in the browser (or client) with the session credentials.

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
// non-existing email or wrong password
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

### Current Session Information

* `GET /session`

Reads the session cookie and responds with friendly data.

<table>
<tr><th>Context</th><th>Response</th></tr>
<tr><td>After successful sign-in</td><td>

```javascript
// statusCode: 200
{
  "id": "12345",
  "username": "MyUsername"
}
```

</td></tr>

<tr><td>Not signed in</td><td>

```javascript
// statusCode: 401 Unauthorized
// empty response
```

</td></tr>

</table>

To change this output, set `authorizer.session.fields` with an array of field names. Read more in [Configuration](#configuration) section.

### User Sign-out

* `DELETE /session`

Signs a user out, removing the session cookie from the browser/client.

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

## Configuration

Settings can be customized after creating an instance.

### `authorizer.session`

Configures the session handler.

```javascript
authorizer.session.secret = null // REQUIRED! when not set, function will crash
authorizer.session.name = 'userSession' // cookie name
authorizer.session.duration = 24 * 60 * 60 * 1000, // session expiration in ms
authorizer.session.activeDuration = activeDuration: 1000 * 60 * 5 // session active duration in ms
authorizer.session.fields = ['username'] // list of fields to expose in session object; id is automatically included
```

`authorizer.secret` is an alias to `authorizer.session.secret`. 

### `authorizer.database`

Configures the database handler. 

Properties are not related to any specific driver, but the default driver is Google Datastore.

```javascript
authorizer.database.table = 'User' // Datastore "Kind", MySQL/Postgres table name, etc
authorizer.database.namespace = null // Datastore namespace, MySQL database name, Postgres schema, etc
authorizer.database.fields.primary = 'username' // name of the field that is used together with password during sign-in
authorizer.database.fields.password = 'password' // name of the field that stores the password
```

### `authorizer.headers`

Array of headers that are sent in all responses.

CORS and security headers should be included here, if your browser/client needs them.

```javascript
authorizer.headers.push(['Access-Control-Allow-Origin', '*'])
```

## Authorizing _other_ Google Functions

Include this library in your other Google Functions (i.e., API endpoints that require session cookie), replicate the same settings (this is important!) and call `authorize` method to validate the session:

```javascript
const Authorizer = require('google-function-authorizer')
const authorizer = new Authorizer()

// configure the authorizer the same way in all functions
authorizer.secret = ...
// ... rest of settings

// Entry Point
exports.handleRequest = function (req, res) {
  authorizer.authorize(req, res, mainFunction) // <-- authorize request first
}

// Your code
function mainFunction (req, res, user) {
  // session cookie is valid -- execute the rest of your function
}
```

If the session is valid, a `user` object will be passed along to your main function with the fields exposed in `authorizer.session.fields`.

If the session is invalid, a `401 - Unauthorized` error will be returned automatically, and your main function won't be called. If you want to take control of error processing, pass a fourth argument to `authorize` with an error function that takes `req` and `res` arguments.

## TODO/Wishlist

* Use environment variables in settings to avoid copy/paste of settings in different functions.
  * Google Functions still do not support environment variables, but it's on the way.
* Google reCAPTCHA support on user sign-in.
* Email service support (Mailgun, SendGrid, etc) for confirmation messages.
* Support other data stores (like MySQL/Postgres).

## License

MIT
