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

exports.getSelf = async ctx => {
  try {
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

exports.getAllTokens = async ctx => {
  try {
    let smartContract = new ctt({ contractHash: process.env.CTT_MANAGER, type: 'manager' });
    let { address } = smartContract.caller;
    const allTokens = await smartContract.contract.methods.getAllTokens(address).call({ from: address });
    const listTokens = [];
    for (let index = 0; index < allTokens['0'].length; index++) {
      listTokens.push({ token: allTokens['0'][index], type: allTokens['1'][index] });
    }
    ctx.status = 200;
    ctx.body = { token: listTokens, message: "Dados encontrados!", };
  } catch (error) {
    console.log('getAllTokens ERROR: ', error);
    ctx.status = 500;
    ctx.body = {
      message: "Falha ao buscar os tokens!",
      data: error,
      error: true
    };
  }
};

exports.getAllowedFactories = async ctx => {
  try {
    let smartContract = new ctt({ contractHash: process.env.CTT_MANAGER, type: 'manager' });
    let { address } = smartContract.caller;
    const allFactories = await smartContract.contract.methods.getAllowedFactories().call({ from: address });
    ctx.status = 200;
    ctx.body = { factories: allFactories, message: "Dados encontrados!", };
  } catch (error) {
    console.log('getAllowedFactories ERROR: ', error);
    ctx.status = 500;
    ctx.body = {
      message: "Falha ao buscar as factories!",
      data: error,
      error: true
    };
  }
};

exports.getManagerOwner = async ctx => {
  try {
    let smartContract = new ctt({ contractHash: process.env.CTT_MANAGER, type: 'manager' });
    let { address } = smartContract.caller;
    const cttOwner = await smartContract.contract.methods.owner().call({ from: address });
    ctx.status = 200;
    ctx.body = { owner: cttOwner, message: "Dados encontrados!", };
  } catch (error) {
    console.log('getManagerOwner ERROR: ', error);
    ctx.status = 500;
    ctx.body = {
      message: "Falha ao buscar o owner!",
      data: error,
      error: true
    };
  }
};

exports.getFactoryBasicInfo = async ctx => {
  try {
    const { factory } = ctx.request.query;
    let smartContract = new ctt({ contractHash: factory, type: 'factory' });
    let { address } = smartContract.caller;
    const cttOwner = await smartContract.contract.methods.owner().call({ from: address });
    const factoryManager = await smartContract.contract.methods.factoryManager().call({ from: address });
    const feeTo = await smartContract.contract.methods.feeTo().call({ from: address });
    const implementationERC1155 = await smartContract.contract.methods.implementationERC1155().call({ from: address });
    const implementationERC20 = await smartContract.contract.methods.implementationERC20().call({ from: address });
    const implementationERC721 = await smartContract.contract.methods.implementationERC721().call({ from: address });
    ctx.status = 200;
    ctx.body = { info: {
      owner: cttOwner,
      manager: factoryManager,
      feeTo,
      baseERC20: implementationERC20,
      baseERC721: implementationERC721,
      baseERC1155: implementationERC1155
    }, message: "Dados encontrados!", };
  } catch (error) {
    console.log('getFactoryBasicInfo ERROR: ', error);
    ctx.status = 500;
    ctx.body = {
      message: "Falha ao buscar as informações!",
      data: error,
      error: true
    };
  }
};

exports.emitToken = async ctx => {
  try {
    ctx.validate(); // validate body

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

    const { factory, name, symbol, decimals, totalSupply, maxSupply, tokenType } = ctx.request.body;
    let smartContract = new ctt({ contractHash: factory, type: 'factory' });

    let resp
    if(tokenType === 0){
      const transactionData = smartContract.contract.methods.createERC20(name, symbol, decimals, totalSupply).encodeABI();
      const estimateGas = await smartContract.contract.methods.createERC20(name, symbol, decimals, totalSupply).estimateGas();
      resp = await smartContract.sendSignedTransaction(transactionData, estimateGas * 100000);
    }
    if(tokenType === 1){
      const transactionData = smartContract.contract.methods.createERC1155(name, symbol, maxSupply).encodeABI();
      const estimateGas = await smartContract.contract.methods.createERC1155(name, symbol, maxSupply).estimateGas();
      resp = await smartContract.sendSignedTransaction(transactionData, estimateGas * 100000);
    }
    if(tokenType === 2){
      const transactionData = smartContract.contract.methods.createERC721(name, symbol).encodeABI();
      const estimateGas = await smartContract.contract.methods.createERC721(name, symbol).estimateGas();
      resp = await smartContract.sendSignedTransaction(transactionData, estimateGas * 100000);
    }

    if (resp.error) {
      ctx.status = 400;
      ctx.body = resp;
      return ctx;
    }

    let tk = new Token({
      chain: resp.chain,
      creator: ctx.user.id,
      blockNumber: resp.data.blockNumber,
      address: resp.data.logs[0].address,
      txhash: resp.data.transactionHash,
    });
    await tk.save();

    ctx.status = 201;
    ctx.body = resp;
  } catch (error) {
    console.log('emitToken ERROR: ', error);
    ctx.status = 500;
    ctx.body = { message: "Falha ao emitir o novo token!", data: error, error: true };
  }
};