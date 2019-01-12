const { UsersApp } = require('@gfa/core/apps/UsersApp')
const { ResourceRouter } = require('@gfa/core/routers/ResourceRouter')
const BcryptAdapter = require('@gfa/bcrypt-adapter')
const ClientSessionsAdapter = require('@gfa/client-sessions-adapter')
const FirestoreAdapter = require('@gfa/firestore-adapter')

class Users extends UsersApp {
  constructor (opts) {
    opts = opts || {}
    var passwordOpts = opts.password
    delete opts.password
    var sessionOpts = opts.session
    delete opts.session
    var databaseOpts = opts.database
    delete opts.database
    var database = new FirestoreAdapter(databaseOpts)
    var password = new BcryptAdapter(passwordOpts)
    var session = new ClientSessionsAdapter(sessionOpts)
    var router = new ResourceRouter()
    super(Object.assign(opts, { router, password, session, database }))
  }
}

module.exports = Users
