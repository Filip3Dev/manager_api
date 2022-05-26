'use strict';

const controller = require('./backoffice.controller');
const authService = require('../../utils/auth');
const {
  schemaBodyLogin,
  schemaBodyLoginGoogle,
  schemaBodyRegister,
  schemaBodyApiKey
} = require('../../utils/validators');

module.exports = Router => {
  const router = new Router({ prefix: `/backoffice` });

  router
    .get('/users', authService.authorize, controller.getUsers)
    .get('/users/:id', authService.authorize, controller.getUser)
    .get('/roles', authService.authorize, controller.getRoles)
    .get('/tokens', authService.authorize, controller.getTokens)
  return router;
};
