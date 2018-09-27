# google-function-authorizer

A simple user authentication and management system for [Google Cloud HTTP Functions](https://cloud.google.com/functions/docs/writing/http).

It stores user data in [Google Datastore](https://cloud.google.com/datastore/) using [gstore-node](https://github.com/sebelga/gstore-node); hashes passwords with [bcrypt](https://github.com/kelektiv/node.bcrypt.js); and manages browser sessions with [client-session](https://github.com/mozilla/node-client-sessions).

## Usage

Create a new Google HTTP Function with the following code:

```javascript
const users = require('google-function-authorizer')({
  session: {secret: 'MYSECRETKEY'} // required!
});

exports.handleRequest = function (req, res) {
  users.handle(req, res);
};
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

Then, assuming you named your function "users", the following endpoints will be served by your function:

* `POST /users`
* `POST /users/signin`
* `POST /users/signout`
* `GET /users`
* `GET /users/:id`
* `PUT|PATCH /users/:id`
* `DELETE /users/:id`
* `DELETE /users/signin`
* `OPTIONS /users(/*)`

Read more about how each endpoint works in the next section.

## Actions

All actions respond with a JSON object with a `code` attribute with the following possible string values:

* `OK` - action has completed successfully
* `BAD_REQUEST` - action has failed due to request not being in expected format
* `NOT_FOUND` - endpoint not found, or user not found
* `UNAUTHORIZED` - action requires that a user signs in first
* `FORBIDDEN` - action requires that signed-in user has permission to perform it
* `INTERNAL_ERROR` - an unexpected error has occurred while performing the action

### Create User

* `POST /users`

This endpoint creates a new user.

<table>
<tr><th>Request Body</th><th>Response</th></tr>
<tr><td>

```javascript
{
  "username": "MyUsername",
  "email": "myemail@test.com",
  "password": "abc123"
}
```

</td><td>

```javascript
{
  "code": "OK",
  "user": {
    "id": "12345",
    "username": "MyUsername",
    "email": "myemail@test.com"
  }
}
```

</td></tr>
</table>

### Sign User In

* `POST /users/signin`

Signs a user in, starting a new session.

This endpoint sets a session cookie upon successful response, which will be sent in the next requests.

<table>
<tr><th>Request Body</th><th>Response</th></tr>
<tr><td>

```javascript
{
  "email": "myemail@test.com",
  "password": "abc123"
}
```

</td><td>

```javascript
{
  "code": "OK",
  "user": {
    "id": "12345",
    "username": "MyUsername",
    "email": "myemail@test.com"
  }
}
```

</td></tr>
</table>

### Sign User Out

* `POST /users/signout`
* `DELETE /users/signin` (alternatively)

Signs a user out, removing the session cookie.

<table>
<tr><th>Request Body</th><th>Response</th></tr>
<tr><td>(empty)</td><td>

```javascript
{
  "code": "OK"
}
```

</td></tr>
</table>

### List Users

* `GET /users`

Returns a list of users with pagination. Default page size is 20.

By default, this endpoint requires the signed-in user role to be `admin`.

<table>
<tr><th>Request Query Parameters</th><th>Response</th></tr>
<tr><td>

* `/users`
  * first 20 users
* `/users?limit=10`
  * first 10 users
* `/users?start=NextPageKey000123`
  * first 20 users
  * starting from key "NextPageKey000123"

</td><td>

```javascript
{
  "code": "OK",
  "items": [
    {"id": "1", "username": "user1", "email": "email1@test.com", ...},
    {"id": "2", "username": "user2", "email": "email2@test.com", ...},
    ...
  ],
  "limit": 20,
  "next": "NextPageKey000123"
}
```

</td></tr>
</table>

The `next` attribute will be absent from the response if there are no more entries to fetch.

(Filters and sorting are not yet supported.)

### Show User

* `GET /users/:id`

Returns data of a single user.

By default, this endpoint has the following requirements:

* user ID being requested matches with signed-in user ID; or
* the signed-in user role is `admin`.

<table>
<tr><th>Request URI</th><th>Response</th></tr>
<tr><td>

* `/users/12345`
  * shows info of user ID=12345

</td><td>

```javascript
{
  "code": "OK",
  "user": {
    "id": "12345",
    "username": "MyUsername",
    "email": "myemail@test.com"
  }
}
```

</td></tr>
</table>

### Update User

* `PUT /users/:id`
* `PATCH /users/:id`

Updates data of a single user, including password.

Both `PUT` and `PATCH` methods behave the same way, and partial data can be provided.

By default, this endpoint has the following requirements:

* user ID being updated matches with signed-in user ID; or
* the signed-in user role is `admin`.

(Not yet implemented) The user `role` attribute can only be updated by other admins.

<table>
<tr><th>Request Body</th><th>Response</th></tr>
<tr><td>

```javascript
{
  "username": "EditedUsername"
}
```

</td><td>

```javascript
{
  "code": "OK",
  "user": {
    "id": "12345",
    "username": "EditedUsername",
    "email": "myemail@test.com"
  }
}
```

</td></tr>
</table>

### Destroy User

* `DELETE /users/:id`

Removes a user.

By default, this endpoint has the following requirements:

* user ID being deleted matches with signed-in user ID; or
* the signed-in user role is `admin`.

If user being deleted matches the user currently signed in, the user will be automatically signed out.

<table>
<tr><th>Request Body</th><th>Response</th></tr>
<tr><td>(empty)</td><td>

```javascript
{
  "code": "OK"
}
```

</td></tr>
</table>

### Preflight Requests / Current Signed-in User

* `OPTIONS /users`

Some clients will fire a "preflight request" prior to making the real request to verify CORS options, which are supported by this library.

You can also use this method to retrieve the current signed-in user, which will be present in the response body, as well as the current endpoint rules (see Configuration for details), which the client can then use to prevent certain actions on their side.

<table>
<tr><th>Request Body</th><th>Response</th></tr>
<tr><td>(empty)</td><td>

```javascript
{
  "code": "OK",
  "userId": "12345",
  "rules": {
    "signin": "all",
    "create": "all",
    "update": "self",
    "find": "self",
    "list": "admin",
    "destroy": "self"
  }
}
```

</td></tr>
</table>

## Authorization

Call `authorize` in your _other_ Google Functions to have the session cookie read from the request before calling your code:

```javascript
const users = require('google-function-authorizer')({
  session: {secret: 'MYSECRETKEY'} // required! must be the same as your users endpoint!
});

exports.handleRequest = function (req, res) {
  users.authorize(req, res, mainFunction);
};

function mainFunction (req, res, user) {
  // session is valid -- execute the rest of your function
}
```

If the session is valid, a `user` object will be passed along to your main function, containing a subset of stored attributes.

If the session is invalid, a `401 - Unauthorized` error will be returned automatically. If you want to take control of error processing, pass a fourth argument to `authorize` with an error function that takes `req` and `res` arguments.

## Roles

This library comes with a very simple role management system built-in.

The default rules are:

* Anyone can create a user or sign in.
* Users with `admin` role are able to edit and delete other users.
* Users with any other role are only allowed to edit or delete themselves.
* Only admins can list users.
* Users cannot be created with a role, since that specific endpoint is public.
  * Another admin must edit newly created users if they need defined roles.

These rules are customizable. Refer to the next section to learn how to change them.

## Configuration

Settings can be customized upon requiring the library, and have the following defaults:

```javascript
const users = require('google-function-authorizer')({

  // Configure session cookie behavior here.
  session: {
    name: 'userSession', // cookie name
    secret: null, // must be set! will raise error (and crash) if not defined
    duration: 24 * 60 * 60 * 1000, // session expiration in ms
    activeDuration: 1000 * 60 * 5 // session active duration in ms
  },

  // Datastore settings.
  datastore: {
    kind: 'User',
    namespace: undefined
  },

  // You can overwrite the full schema, but it needs at least:
  // - the primary field, and
  // - the password field.
  // Both field names can be defined in the "fields" section.
  // If your schema is missing "confirmation" fields,
  //   confirmation workflows will not run.
  schema:  {
    username: {
      type: 'string',
      optional: true,
      excludeFromIndexes: true
    },
    email: {
      type: 'string',
      required: true,
      validate: 'isEmail'
    },
    password: {
      type: 'string',
      required: true,
      read: false,
      excludeFromIndexes: true
    },
    role: {
      type: 'string',
      write: false
    },
    confirmationToken: {
      type: 'string',
      read: false
    },
    confirmedOn: {
      type: 'datetime',
      excludeFromIndexes: true
    },
    createdOn: {
      type: 'datetime',
      write: false,
      default: Gstore.defaultValues.NOW,
      excludeFromIndexes: true
    },
    modifiedOn: {
      type: 'datetime',
      write: false,
      excludeFromIndexes: true
    }
  },

  // If you use a custom schema, you can have custom field names as well.
  fields: {
    primary: 'email', // will be used in signin with password
    username: 'username',
    email: 'email',
    password: 'password',
    role: 'role'
  },

  // Customize CORS headers here to anything you'd like.
  // Multiple headers are accepted.
  cors: {
    "Access-Control-Allow-Origin": "*"
  },

  // Apply rules for certain user-related actions.
  // The following values are accepted:
  // - "all": public and unrestricted access
  // - "user": access for logged-in users only
  // - "self": access for record owner only, or admins
  // - "admin": admin access only
  // - false: endpoint is disabled
  //   (useful if you want to disable user creation, for example)
  // Absence of field or value will default to "admin".
  rules: {
    signin: 'all',
    create: 'all',
    update: 'self',
    find: 'self',
    list: 'admin',
    destroy: 'self'
  }

});

exports.handleRequest = function (req, res) {
  users.handle(req, res);
};
```

Please note that __settings must be the same across all functions__. So if you change any of the default values, make sure to replicate them accordingly.

_When Google Cloud Functions support environment variables, we will change this approach so configuration can be unified and the copy/pasting avoided._

If you want to customize Schema validators with your own functions, take a look at the [Gstore Schema documentation](https://sebelga.gitbooks.io/gstore-node/content/schema/).

## TODO/Wishlist

* Google reCAPTCHA support on user creation and update.
* Email service support (Mailgun, SendGrid, etc) for sending various confirmation messages.
* Customizable cache TTL support for `authorization`.
  * Currently, it stores values in session until user signs out or session expires.
* Support other data stores (like MySQL).
* Support JSON Web Tokens instead of client-sessions.

## License

MIT
