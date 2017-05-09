'use strict';

const datastore = require('@google-cloud/datastore')();
const Gstore = require('gstore-node');
Gstore.connect(datastore);

const Schema = Gstore.Schema;

const schema = new Schema({
  username: {
    type: 'string'
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
    excludeFromIndexes: true
  }
});

// Queries

schema.queries('list', {
  limit: 20,
  select: ['username', 'email'],
  showKey: false
});

const User = Gstore.model('User', schema);

module.exports = User;
