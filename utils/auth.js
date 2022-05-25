"use strict";
const jwt = require("jsonwebtoken");
const { SALT_KEY } = require('../config').server;
const Apikey = require('../models/Apikey');
const User = require('../models/User');
const Log = require('../models/Log');
const { logger } = require('../utils/logger');

exports.generateToken = async data => {
  return jwt.sign(data, SALT_KEY, { expiresIn: "24h" });
};

exports.decodeToken = async token => {
  var data = await jwt.verify(token, SALT_KEY);
  return data;
};

exports.authorize = async function(ctx, next) {
  let token = ctx.request.headers["x-access-token"];
  if (!token) {
    ctx.status = 401;
    ctx.body = {
      message: "Acesso restrito!",
      error: true
    };
    return 0;
  }
  let verification = await jwt.verify(token, SALT_KEY);
  if (!verification) {
    ctx.status = 401;
    ctx.body = {
      message: "Token Inválido!",
      error: true
    };
    return 0;
  }
  ctx.user = {
    id: verification.id,
    name: verification.name,
    email: verification.email
  }
  await next();
};

exports.authorizeApi = async function(ctx, next) {
  let token = ctx.request.headers["x-api-key"];
  if (!token) {
    ctx.status = 401;
    ctx.body = { message: "Acesso restrito!", error: true };
    return 0;
  }
  let verification = await Apikey.findOne({ api_key: token }).lean();
  if (!verification) {
    ctx.status = 401;
    ctx.body = { message: "Chave de API Inválido!", error: true };
    return 0;
  }
  if (!verification.status) {
    ctx.status = 401;
    ctx.body = { message: "Chave de API desabilitada!", error: true };
    return 0;
  }
  let verificationUser = await User.findOne({ _id: verification.user }).lean();
  if (!verificationUser) {
    ctx.status = 401;
    ctx.body = { message: "Chave de API não verificada!", error: true };
    return 0;
  }
  ctx.apikey = verification;
  ctx.user = { id: verificationUser._id, name: verificationUser.name, email: verificationUser.email };
  let logi = new Log({ api_key: verification.api_key, user: verificationUser._id, header: ctx.request.header, body: ctx.request.body, method: ctx.method, url: ctx.url });
  await logi.save();
  logger.log({ api_key: verification.api_key, user: verificationUser, header: ctx.request.header, body: ctx.request.body, method: ctx.method, url: ctx.url, kind: 'log_api_auth' });
  await next();
};

exports.authorizeAdmin = function (req, res, next) {
  var token = req.query.token || req.headers['x-access-token'];
  var admin = req.headers["token-control"];

  if (!token) {
    res.status(401).json({
      message: 'Acesso Restrito'
    });
  } else {
    jwt.verify(token, SALT_KEY, function (error, decoded) {
      if (error) {
        res.status(401).json({
          message: 'Token Inválido'
        });
      } else {
        if (admin) next();
      }
    });
  }
};