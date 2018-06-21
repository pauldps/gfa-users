'use strict'

const Gstore = require('gstore-node')

// After changing this object,
//   make sure to copy/paste it into README.
let configuration = {

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
  schema: {
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
    'Access-Control-Allow-Origin': '*'
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

}

configuration.override = function _override (config) {
  /* istanbul ignore if */
  if (!config) {
    return
  }
  _set('session', config)
  _set('datastore', config)
  _set('schema', config)
  _set('fields', config)
  _set('cors', config)
  _set('rules', config)
}

function _set (section, object) {
  if (!object || !object[section]) {
    return
  }
  Object.assign(configuration[section], object[section])
}

module.exports = configuration
