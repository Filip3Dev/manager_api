const Koa = require('koa');
const koaBody = require('koa-body');
const compress = require('koa-compress')();
const cors = require('@koa/cors')();
const helmet = require('koa-helmet')();
const serve = require('koa-static');
const { logger } = require('koa2-winston');
const logges = require('koa-logger')
const winston = require('winston');
const dotenv = require('dotenv')
dotenv.config()
const LogzioWinstonTransport = require('winston-logzio');
const { databaseConfig } = require('./config');
const logzioWinstonTransport = new LogzioWinstonTransport({
  level: 'debug',
  name: 'request_log',
  token: process.env.LOGGER_KEY,
  host: 'listener.logz.io',
});
const logTransp = new winston.transports.Console({
  level: 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
})

const errorHandler = require('./middleware/error.middleware');
const api = require('./api');
const mongoose = require('mongoose');
const server = new Koa();

server.keys = ['some secret hurr'];

mongoose.connect(databaseConfig.mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

require('./models/Link');
require('./models/User');

server
  .use(logger({
    level: 'debug',
    transports: [logzioWinstonTransport, logTransp],
    reqSelect: ['body'],
    reqUnselect: ['header.cookie', 'body.password'],
  }))
  .use(logges())
  .use(errorHandler)
  .use(helmet)
  .use(compress)
  .use(cors)
  .use(koaBody({ multipart: true }))
  .use(serve('.'))

api.applyApiMiddleware(server);

module.exports = server;
