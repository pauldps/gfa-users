'use strict';

const cors = require('./cors');
const sessions = require('client-sessions');

const session = sessions({
  cookieName: 'userSession',
  secret: `ZOMGGCPNEEDSENVVARSLOL${process.env.ENTRY_POINT}${process.env.FUNCTION_MEMORY_MB}`,
  duration: 24 * 60 * 60 * 1000,
  activeDuration: 1000 * 60 * 5
});

module.exports = function _sessionWithCors (req, res, next) {
  cors(req, res, () => {
    session(req, res, () => {
      next(req, res);
    });
  });
};
