'use strict';

require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const Apikey = require('../../models/Apikey');
const Token = require('../../models/Token');
const authService = require('../../utils/auth');
const { logger } = require('../../utils/logger');
const ctt = require('../../utils/dynamicContract');
const mailer = require('../../utils/mailer');
const { SALT_KEY } = require('../../config').server;
const { v4: uuidv4 } = require('uuid');

async function checkUser(ctx) {
  let userGet = await User.findOne({ _id: ctx.user.id }).lean();
    let checkUserTokens = await Token.find({ creator: ctx.user.id }).lean();
    if(userGet.plan == 'basic' && checkUserTokens.length >= 5){
      ctx.status = 400;
      ctx.body = {
        message: `Não é permitido cadastrar novo Token. Tokens atuais: ${checkUserTokens.length}!`,
        data: {},
        error: true
      };
      return ctx;
    }
}

const typeToken = {
  '0': () => 'ERC20',
  '1': () => 'ERC1155',
  '2': () => 'ERC721'
};

exports.mintToken = async ctx => {
  try {
    ctx.validate(); // validate body
    await checkUser(ctx);
    logger.log({
      header: ctx.request.header,
      body: ctx.request.body,
      method: ctx.method,
      url: ctx.url,
      user_info: {},
      kind: 'mintToken'
    });

    const { token, amount, to } = ctx.request.body;
    let smartContract = new ctt({ contractHash: token, type: 'erc20' });
    const decimals = await smartContract.contract.methods.decimals().call({ from: to });

    const transactionData = smartContract.contract.methods.mint(to, amount * (10 ** Number(decimals))).encodeABI();
    const estimateGas = await smartContract.contract.methods.mint(to, amount * (10 ** Number(decimals))).estimateGas();
    let resp = await smartContract.sendSignedTransaction(transactionData, estimateGas * 1000000);

    if (resp.error) {
      ctx.status = 400;
      ctx.body = resp;
      return ctx;
    }

    ctx.status = 201;
    ctx.body = resp;
  } catch (error) {
    console.log('mintToken ERROR: ', error);
    ctx.status = 500;
    ctx.body = { message: "Falha ao mintar o novo token!", data: error, error: true };
  }
};