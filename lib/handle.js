'use strict';

const middleware = require('./middleware');
const route = require('./router');

module.exports = function handle (req, res) {
  middleware(req, res, () => {
    route(req, res);
  });
};
