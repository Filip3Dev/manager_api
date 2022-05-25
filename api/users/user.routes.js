'use strict';

const controller = require('./user.controller');
const authService = require('../../utils/auth');
const {
  schemaBodyLogin,
  schemaBodyRegister,
  schemaBodyApiKey
} = require('../../utils/validators');

module.exports = Router => {
  const router = new Router({ prefix: `/users` });

  router
    .get('/', authService.authorize, controller.getSelf)
    .post('/login', schemaBodyLogin, controller.loginOne)
    .get('/apikey', authService.authorize, controller.listApikeys)
    .post('/apikey', authService.authorize, schemaBodyApiKey, controller.createApikey)
    .delete('/apikey/:keyId', authService.authorize, controller.deleteApikey)
    .post('/', schemaBodyRegister, controller.createOne);
  return router;
};
