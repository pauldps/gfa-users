'use strict';

const sessions = require('client-sessions');

module.exports = sessions({
  cookieName: 'userSession',
  secret: 'ZOMGCHANGETHIS', // FIXME pls
  duration: 24 * 60 * 60 * 1000,
  activeDuration: 1000 * 60 * 5
});
