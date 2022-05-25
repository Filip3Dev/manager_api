'use strict';

require('mongoose');
const md5 = require('md5');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const Apikey = require('../../models/Apikey');
const authService = require('../../utils/auth');
const { logger } = require('../../utils/logger');
const mailer = require('../../utils/mailer');
const { SALT_KEY } = require('../../config').server;
const { v4: uuidv4 } = require('uuid');

exports.getSelf = async ctx => {
  try {
    if (!ctx.user) {
      ctx.status = 500;
      ctx.body = { message: "Falha ao validar os dados!", error: true };
      return 0;
    }
    let usuario = await User.findOne({ _id: ctx.user.id }, '-password').lean();
    ctx.status = 200;
    ctx.body = { user: usuario, message: "Dados encontrados!", };
  } catch (error) {
    console.log('getSelf ERROR: ', error);
    ctx.status = 400;
    ctx.body = {
      message: "Falha ao buscar o usuario!",
      data: error,
      error: true
    };
  }
};

exports.loginOne = async ctx => {
  try {
    ctx.validate(); // validate body
    let { email, password, user_info = {} } = ctx.request.body;
    logger.log({
      header: ctx.request.header,
      body: ctx.request.body,
      method: ctx.method,
      url: ctx.url,
      user_info: user_info,
      kind: 'login'
    });
    let userGet = await User.findOne({ email }, '-passResetToken -passResetExpires').lean();
    let checkPass = await bcrypt.compare(password, userGet.password);
    if(!checkPass || !userGet){
      ctx.status = 400;
      ctx.body = {
        message: "Usuario ou senha invalidos!",
        data: {},
        error: true
      };
      return 0;
    }

    if (userGet.status === "deactive") {
      ctx.status = 400;
      ctx.body = {
        message: "Sua conta não foi verificada!",
        data: { email: userGet.email },
        error: true
      };
      return 0;
    }
    let token = await authService.generateToken({
      email: userGet.email,
      id: userGet._id,
      name: userGet.name,
    })
    delete userGet.password;
    ctx.status = 200;
    ctx.body = { user: userGet, token };
  } catch (error) {
    console.log('createOne ERROR: ', error);
    ctx.status = 400;
    ctx.body = {
      message: "Falha ao cadastrar o usuario!",
      data: error,
      error: true
    };
  }
};

exports.createOne = async ctx => {
  try {
    ctx.validate(); // validate body
    let { email, name, cpf, password, user_info = {} } = ctx.request.body;
    logger.log({
      header: ctx.request.header,
      body: ctx.request.body,
      method: ctx.method,
      url: ctx.url,
      user_info: user_info,
      kind: 'createOne'
    });
    let isValid = /(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)/.test(cpf);
    if (!isValid) {
      ctx.status = 400;
      ctx.body = { message: "CPF informado não é valido!", data: { cpf }, error: true };
      return ctx;
    }

    let userGet = await User.findOne({ email, cpf }).lean();
    if (userGet) {
      ctx.status = 400;
      ctx.body = { message: "Usuario já registrado na base!", data: {}, error: true };
      return ctx;
    }
    let pass = await bcrypt.hash(password, 10);
    let newUser = new User({ email, name, cpf, password: pass });
    newUser = await newUser.save();
    ctx.status = 201;
    ctx.body = { date: newUser, error: false, message: 'Usuario registrado com sucesso!' };
  } catch (error) {
    console.log('createOne ERROR: ', error);
    ctx.status = 400;
    ctx.body = {
      message: "Falha ao cadastrar o usuario!",
      data: error,
      error: true
    };
  }
};

exports.listApikeys = async ctx => {
  try {
    logger.log({
      header: ctx.request.header,
      body: ctx.request.body,
      method: ctx.method,
      url: ctx.url,
      user_info: {},
      user: ctx.user,
      kind: 'listApikeys'
    });
    let userGet = await User.findOne({ _id: ctx.user.id }).lean();
    if (!userGet) {
      ctx.status = 400;
      ctx.body = { message: "Falha ao validar a requisição!", data: {}, error: true };
      return ctx;
    }

    let apisGet = await Apikey.find({ user: userGet._id }).lean();

    ctx.status = 200;
    ctx.body = { data: apisGet, error: false, message: 'Sucesso!' };
  } catch (error) {
    console.log('listApikeys ERROR: ', error);
    ctx.status = 500;
    ctx.body = {
      message: "Falha ao listar as Chaves de API!",
      data: error,
      error: true
    };
  }
};

exports.createApikey = async ctx => {
  try {
    ctx.validate(); // validate body
    let { title, network, user_info = {} } = ctx.request.body;
    logger.log({
      header: ctx.request.header,
      body: ctx.request.body,
      method: ctx.method,
      url: ctx.url,
      user_info: user_info,
      user: ctx.user,
      kind: 'createApikey'
    });
    let userGet = await User.findOne({ _id: ctx.user.id }).lean();
    if (!userGet) {
      ctx.status = 400;
      ctx.body = { message: "Falha ao validar a requisição!", data: {}, error: true };
      return ctx;
    }

    let apisGet = await Apikey.find({ user: userGet._id }).lean();
    if(userGet.plan == 'basic' && apisGet.length >= 2){
      ctx.status = 400;
      ctx.body = {
        message: `Não é permitido cadastrar nova Chave de API. Chaves atuais ${apisGet.length}!`,
        data: {},
        error: true
      };
      return ctx;
    }

    let newKey = new Apikey({ title, network, api_key: uuidv4(), status: true, user: userGet._id });
    newKey = await newKey.save();
    ctx.status = 201;
    ctx.body = { date: newKey, error: false, message: 'Registro efetuado com sucesso!' };
  } catch (error) {
    console.log('createApikey ERROR: ', error);
    ctx.status = 400;
    ctx.body = {
      message: "Falha ao cadastrar a Chave de API!",
      data: error,
      error: true
    };
  }
};

exports.deleteApikey = async ctx => {
  try {
    logger.log({
      header: ctx.request.header,
      body: ctx.request.body,
      method: ctx.method,
      url: ctx.url,
      user_info: {},
      user: ctx.user,
      kind: 'deleteApikey'
    });

    let { keyId } = ctx.params;
    await Apikey.findOneAndDelete({ _id: keyId, user: ctx.user.id });

    ctx.status = 200;
    ctx.body = { date: {}, error: false, message: 'Remoção efetuada com sucesso!' };
  } catch (error) {
    console.log('deleteApikey ERROR: ', error);
    ctx.status = 500;
    ctx.body = {
      message: "Falha ao remover a Chave de API!",
      data: error,
      error: true
    };
  }
};