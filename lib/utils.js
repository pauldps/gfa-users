'use strict';

module.exports = {
  badRequest: function _badRequest (res, code) {
    res.status(400).json({code});
  }
};
