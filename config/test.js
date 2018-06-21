'use strict'

require('dotenv').config()

// If you have a credentials file, create .env and
//   define GOOGLE_APPLICATION_CREDENTIALS in it.
// It will allow your tests to connect to a real
//   Datastore server, which can be needed for CI.
// Otherwise, the Datastore emulator will be used.
// If you have the Emulator outside Docker, run it first
//   (consistency 1.0 is required for testing):
//   gcloud beta emulators datastore start --consistency 1.0 --no-store-on-disk &
//   export DATASTORE_EMULATOR_HOST=localhost:8081
//   export GCLOUD_PROJECT=test
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  delete process.env.DATASTORE_EMULATOR_HOST
  delete process.env.GCLOUD_PROJECT
}
