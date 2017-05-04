'use strict';

const Gstore = require('gstore-node');
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
    read: false,
    excludeFromIndexes: true
  },
  role: {
    type: 'string',
    write: false
  },
  confirmationToken: {
    type: 'string'
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

const User = Gstore.model('User', schema);

module.exports = User;
