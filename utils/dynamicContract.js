'use strict';

const Tx = require('ethereumjs-tx').Transaction;
const { default: Common, CustomChain } = require('@ethereumjs/common')
const fs = require('fs');
const Web3 = require('web3');
require('dotenv').config();

const queryCtt = {
  'manager': () => '/contracts/TokenFactoryManager.json',
  'factory': () => '/contracts/StandardTokenFactory.json',
  'erc20': () => '/contracts/StandardERC20.json',
  'erc721': () => '/contracts/Standard721.json',
  'erc1155': () => '/contracts/Standard1155.json'
};

// logFruit[fruit]();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
class DynamicSmartContract {
  constructor({ contractHash, type }) {
    const contractInterface = fs.readFileSync(__dirname+queryCtt[type](), 'utf-8');
    const web3Provider = process.env.POLYGON_T;
    // const web3Provider = process.env.NET === 'testnet' ? process.env.PROVIDER_TEST : process.env.PROVIDER_MAIN;
    
    this._interface = JSON.parse(contractInterface).abi;
    
    this._web3 = new Web3();
    this._web3.setProvider(new this._web3.providers.HttpProvider(web3Provider));
    let publicKey = this._web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
    this._web3.eth.defaultAccount = publicKey.address;
    this._contract = new this._web3.eth.Contract(this._interface, contractHash);
    this._contractHash = contractHash

    this._caller = publicKey;

    this._gasLimit = 20000000;
  }

  async sendSignedTransaction(transactionData, estimateGas) {
    const txCount = await this._web3.eth.getTransactionCount(this._caller.address);
    let { gasLimit } = await this._web3.eth.getBlock('latest');
    this._gasLimit = gasLimit;
    const txObject = {
      nonce: this._web3.utils.toHex(txCount),
      to: this._contractHash,
      value: this._web3.utils.toHex(this._web3.utils.toWei('0', 'ether')),
      gasLimit: this._web3.utils.toHex(this._gasLimit),
      gasPrice: this._web3.utils.toHex(String(estimateGas)),
      maxFeePerGas: this._web3.utils.toHex(this._web3.utils.toWei('4', 'gwei')),
      data: transactionData
    };
    // const common = Common.custom(process.env.NET === 'testnet' ? CustomChain.PolygonMumbai : CustomChain.PolygonMainnet);
    const common = Common.custom(CustomChain.PolygonMumbai);
    const tx = new Tx(txObject, { common });
    tx.sign(Buffer.from(PRIVATE_KEY, 'hex'));

    const serializedTx = tx.serialize();
    const raw = '0x' + serializedTx.toString('hex');

    try {
      console.log('Sending transaction...');
      const transaction = await this._web3.eth.sendSignedTransaction(raw);
      const saldo = await this._web3.eth.getBalance(this._caller.address);
      console.log('saldo Final => ', this._web3.utils.fromWei(saldo, 'ether'));
      let chain = await this._web3.eth.getChainId();
      return {
        error: false,
        message: 'Transação registrada',
        chain,
        data: transaction,
      };
    } catch (error) {
      console.log('error: ', error);
      return {
        error: true,
        message: 'Falha ao registrar transação',
        data: error
      };
    }

  }

  get caller() {
    return this._caller;
  }

  get contract() {
    return this._contract;
  }

  get gasLimit() {
    return this._gasLimit;
  }

  get interface() {
    return this._interface;
  }
}

module.exports = DynamicSmartContract;