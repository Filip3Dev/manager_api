const { Joi, bodySchema } = require('koa-body-validator');


exports.schemaBodyLogin = bodySchema({
  email: Joi.string().email().required(),
  password: Joi.string().min(7).required(),
  user_info: Joi.any()
});

exports.schemaBodyLoginGoogle = bodySchema({
  token: Joi.string(),
  user_info: Joi.any()
});

exports.schemaBodyRegister = bodySchema({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  cpf: Joi.string().required(),
  password: Joi.string().min(7).required(),
  user_info: Joi.any()
});

exports.schemaBodyApiKey = bodySchema({
  title: Joi.string().required(),
  network: Joi.number().required(),
  user_info: Joi.any()
});

exports.schemaBodyEmitToken = bodySchema({
  factory: Joi.string().required(),
  name: Joi.string().required(),
  symbol: Joi.string().required(),
  tokenType: Joi.number().required(),
  decimals: Joi.number(),
  totalSupply: Joi.number(),
  maxSupply: Joi.number(),
});

exports.schemaBodyMintToken = bodySchema({
  token: Joi.string().required(),
  to: Joi.string().required(),
  amount: Joi.number().required()
});
