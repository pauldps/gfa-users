'use strict'

const config = require('./configuration')
const Gstore = require('gstore-node')
const datastore = require('@google-cloud/datastore')({
  namespace: config.datastore.namespace
})

Gstore.connect(datastore)

const Schema = Gstore.Schema
const schema = new Schema(config.schema)

// Queries

schema.queries('list', {
  limit: 20,
  select: [config.fields.primary]
})

const User = Gstore.model(config.datastore.kind, schema)

module.exports = User
