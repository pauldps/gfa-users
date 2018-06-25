# google-function-authorizer

[![Build Status](https://semaphoreci.com/api/v1/pauloddr/google-function-authorizer/branches/master/shields_badge.svg)](https://semaphoreci.com/pauloddr/google-function-authorizer)
[![Test Coverage](https://lima.codeclimate.com/github/pauloddr/google-function-authorizer/badges/coverage.svg)](https://lima.codeclimate.com/github/pauloddr/google-function-authorizer/coverage)
[![Code Climate](https://lima.codeclimate.com/github/pauloddr/google-function-authorizer/badges/gpa.svg)](https://lima.codeclimate.com/github/pauloddr/google-function-authorizer)
[![npm version](https://badge.fury.io/js/google-function-authorizer.svg)](https://badge.fury.io/js/google-function-authorizer)

A simple user authentication system for [Google Cloud HTTP Functions](https://cloud.google.com/functions/docs/writing/http).

It relies on the following dependencies:

* [@google-cloud/datastore](https://github.com/googleapis/nodejs-datastore) - for reading user data from [Google Datastore](https://cloud.google.com/datastore/).
* [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) - for verifying passwords.
* [client-sessions](https://github.com/mozilla/node-client-sessions) - for session management.

## Usage

Create a new Google HTTP Function with the following code:

```javascript
const {Authorizer} = require('google-function-authorizer')
const authorizer = new Authorizer({
  session: {secret: 'MySecretKey'} // must be set!
})

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

Then, assuming the name of your Google Function is "session", the following endpoints will be served:

* `POST /session` - creates a new session (user sign-in)
* `GET /session` - returns information about current session
* `DELETE /session` - destroys session (user sign-out)
* `OPTIONS /session` - returns headers

## Requirements

This package reads user data from [Google Datastore](https://cloud.google.com/datastore/). As such, Datastore must be enabled in the Google Project, and user data should already exist.

Refer to [Configuration](#configuration) to determine which Datastore Kind and properties will be used for fetching and verifying user data.

## API

This section details the endpoints served by the function.

A function name of "session" is used in the examples. If your function has a different name, endpoints will have that name instead.

### User Sign-In

* `POST /session`

This endpoint creates a new session if provided username/password are valid.

Successful responses set a cookie in the browser (or client) with the session credentials.

<table>
<tr><th>Request Body</th><th>Response</th></tr>
<tr><td>

```javascript
// valid credentials
{
  "username": "MyUsername",
  "password": "abc123"
}
```

</td><td>

```javascript
// statusCode: 201 Created
{
  "id": "12345",
  "username": "MyUsername"
}
```

</td></tr>

<tr><td>

```javascript
// non-existing username or wrong password
{
  "username": "MyUsername",
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
<tr><td>Session cookie present</td><td>

```javascript
// statusCode: 200 OK
{
  "id": "12345",
  "username": "MyUsername"
}
```

</td></tr>

<tr><td>Session cookie not present</td><td>

```javascript
// statusCode: 401 Unauthorized
// empty response
```

</td></tr>

</table>

To change this output, set `authorizer.session.expose` with an array of field names. `id` is included by default.

### User Sign-Out

* `DELETE /session`

Signs a user out, removing the session cookie from the browser/client.

<table>
<tr><th>Request Body</th><th>Response</th></tr>
<tr><td>(empty)</td><td>

```javascript
// statusCode 204 No Content
// empty response
```

</td></tr>
</table>

### Preflight Requests

* `OPTIONS /session`

Some clients will fire a "preflight request" prior to making the real request to verify CORS options and other security headers.

<table>
<tr><th>Request Body</th><th>Response</th></tr>
<tr><td>(empty)</td><td>

```javascript
// statusCode 204 No Content
// empty response with CORS and other security headers
```

</td></tr>
</table>

## Configuration

Setting environment variables is the preferred way of configuration, as it prevents duplication of settings across different functions.

_(Please note that Google Functions do not support environment variables at this time, but [support is on its way](https://issuetracker.google.com/issues/35907643). Meanwhile, alternatives exist, like using [dotenv](https://github.com/motdotla/dotenv) and bunding a git-ignored `.env` file into your deployed function.)_

If not using environment variables, settings can be set upon creating an instance. See defaults below.

```javascript
var authorizer = new Authorizer({

  // Session management options
  session: {

    // REQUIRED! if not present, function will intentionally crash
    secret: process.env['GFA_SESSION_SECRET'],

    // name of the session cookie
    name: process.env['GFA_SESSION_NAME'] || 'userSession',

    // session expiration in ms
    duration: +process.env['GFA_SESSION_DURATION'] || (24 * 60 * 60 * 1000),

    // session active duration in ms
    activeDuration: +process.env['GFA_SESSION_ACTIVE_DURATION'] || (1000 * 60 * 5),

    // array of user fields to expose in session object
    // id is already included
    expose: (process.env['GFA_SESSION_EXPOSE'] || 'username').split(',')

  },

  // Datastore configuration
  database: {

    // Datastore "Kind"
    table: process.env['GFA_DATABASE_TABLE'] || 'User',

    // Datastore namespace
    namespace: process.env['GFA_DATABASE_NAMESPACE'],

    fields: {

      // name of the field that is used together with password during sign-in
      primary: process.env['GFA_DATABASE_FIELDS_PRIMARY'] || 'username',

      // name of the field that stores the password
      password: process.env['GFA_DATABASE_FIELDS_PASSWORD'] || 'password'

    }

  },

  // array of headers that are sent in all responses
  // CORS and security headers should be included here, if your browser/client needs them
  headers: []

})
```

## Authorizing _other_ Google Functions

Request the `Session` object from this library in your other Google Functions (i.e., API endpoints that require session credentials), replicate the same settings (this is important!), and then call `authorize()` to validate the session:

```javascript
// Note the different class name
const {Session} = require('google-function-authorizer')

// create and configure this object with the same options
//   as the "session" section in the authorizer configuration
const session = new Session({
  secret: 'MySecretKey',
  // ... other settings
})

// Entry Point
exports.handleRequest = function (req, res) {
  // authorize request first
  session.authorize(req, res, mainFunction)
}

// Your code
function mainFunction (req, res, user) {
  // session is valid -- execute the rest of your function
}
```

If the session is valid, a `user` object will be passed along to your main function. This object will be the same as returned by `GET /session`.

If the session is invalid, a `401 - Unauthorized` error will be automatically returned, and your main function won't be called. If you want to take control of error processing, pass a fourth argument to `session.authorize()` with an error function that takes `req` and `res` arguments.

## License

MIT
