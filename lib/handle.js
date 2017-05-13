'use strict';

const config = require('./configuration');
const middleware = require('./middleware');
const Response = require('./response');
const route = require('./router');

module.exports = function handle (req, res) {
  middleware(req, res, () => {
    const rules = config.rules;
    if (req.method === 'OPTIONS') {
      return Response.ok(res, {
        userId: req[config.session.name].userId,
        rules: rules
      });
    }
    const session = req[config.session.name];
    const rule = rules[req.params.action];
    /* istanbul ignore if */
    if (rule === false) {
      return Response.notFound(res); // endpoint disabled
    }
    if ((rule === 'user' || rule === 'self' || rule === 'admin') && !session.userId) {
      return Response.unauthorized(res);
    }
    if (rule === 'self' && session.role !== 'admin' && session.userId !== req.params.userId) {
      return Response.forbidden(res);
    }
    if (rule === 'admin' && session.role !== 'admin') {
      return Response.forbidden(res);
    }
    route(req, res);
  });
};
