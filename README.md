# google-http-function-datastore-users (under development)
User authentication and management for Google Cloud HTTP Functions with Datastore.

## Authentication

Create a Google Cloud HTTP Function that will serve as you authentication endpoint with the following content:

```javascript
const UserHandler = require('google-http-function-datastore-users');

exports.handleRequest = function (req, res) {
  UserHandler.authenticate(req, res);
};
```

Assuming you named your function `session`, the following requests will be available:

* `POST /session` - creates a new session, signing in an User.
* `DELETE /session` - destroys a session, signing out an User.


## User Management

Create a Google Cloud HTTP Function that will serve as your user management endpoint with the following content:

```javascript
const UserHandler = require('google-http-function-datastore-users');

exports.handleRequest = function (req, res) {
  UserHandler.handleRequest(req, res);
};
```

Assuming you named your function `user`, the following requests will be available:

* `POST /user` - creates a new User in Datastore.
* `PUT|PATCH /user` - updates an User. Requires Authorization header.
* `DELETE /user` - deletes an User. Requires Authorization header.

This is a work in progress.
