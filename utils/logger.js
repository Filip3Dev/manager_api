exports.logger = require('logzio-nodejs').createLogger({
    token: process.env.LOGGER_KEY,
    protocol: 'http',
    host: 'listener.logz.io',
    port: '8070',
    type: 'nodejs',
    debug: false,
    extraFields: { log_type: 'user_info' }
  });