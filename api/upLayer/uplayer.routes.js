'use strict';

const controller = require('./uplayer.controller');
const authService = require('../../utils/auth');
const { schemaBodyMintToken } = require('../../utils/validators');

module.exports = Router => {
  const router = new Router({ prefix: `/uplayer` });

  router
    .post('/mintToken', authService.authorizeApi, schemaBodyMintToken, controller.mintToken);
  return router;
};
