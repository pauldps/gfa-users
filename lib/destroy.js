'use strict'

const config = require('./configuration')
const User = require('./user')
const Response = require('./response')

module.exports = function destroy (req, res) {
  const userId = req.params.userId
  /* istanbul ignore if */
  if (!userId) {
    console.error('Routing Error: Destroy without UserId')
    return Response.internalError(res)
  }
  User.delete(userId, (err, response) => {
    /* istanbul ignore if */
    if (err) {
      console.error('User Deletion Error:', err)
      return Response.internalError(res)
    }
    let session = req[config.session.name]
    if (session.userId === userId) {
      session.reset()
    }
    if (!response.success) {
      return Response.notFound(res)
    }
    Response.ok(res)
  })
}
