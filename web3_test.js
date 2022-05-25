const Web3 = require('web3');
const PRIV_KEY = '894d268711f06351bc2cb9f1a77add074178975aa0661e2af80c62639fabb06d';
async function loadMessage(message) {
    const web3 = new Web3();
    const defaultProvider = new web3.providers.HttpProvider('https://rinkeby.infura.io/v3/1508f57dc5204aa78f0ba81549b48922');
    web3.setProvider(defaultProvider);

    let accountz = await web3.eth.accounts.privateKeyToAccount(PRIV_KEY);

    const account_address = accountz.address;

    let prefix = "\x19Ethereum Signed Message:\n" + message.length;
    let msgHash1 = await web3.utils.sha3(prefix+message);
    console.log( 'msgHash1: ', msgHash1);
    let signature = await web3.eth.accounts.sign(msgHash1, PRIV_KEY);
    console.log( 'signature: ', signature);

    let newMSG = '123456789';
    let prefix2 = "\x19Ethereum Signed Message:\n" + newMSG.length;
    let msgHash2 = await web3.utils.sha3(prefix2+newMSG);
    console.log( 'msgHash2: ', msgHash2);
    let signature2 = await web3.eth.accounts.sign(msgHash2, PRIV_KEY);
    console.log( 'signature2: ', signature2);
    console.log('\n Validation: ', signature2.signature === signature.signature);
}

loadMessage('12345678');