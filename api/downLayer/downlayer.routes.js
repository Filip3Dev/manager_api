'use strict';

const controller = require('./downlayer.controller');
const authService = require('../../utils/auth');
const { schemaBodyEmitToken } = require('../../utils/validators');

module.exports = Router => {
  const router = new Router({ prefix: `/downlayer` });

  router
    .get('/', authService.authorizeApi, controller.getSelf)
    .get('/listTokens', authService.authorizeApi, controller.getAllTokens)
    .get('/getOwner', authService.authorizeApi, controller.getManagerOwner)
    .get('/listFactories', authService.authorizeApi, controller.getAllowedFactories)
    .get('/basicInfo', authService.authorizeApi, controller.getFactoryBasicInfo)
    .get('/tokenInfo', authService.authorizeApi, controller.getTokenInfo)
    .post('/emitToken', authService.authorizeApi, schemaBodyEmitToken, controller.emitToken);
  return router;
};
