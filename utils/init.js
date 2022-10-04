const path = require('path');
const fs = require('fs');
const NodeRSA = require("node-rsa");

const mainPath = path.join(__dirname, '..');
const pubKey = null, priKey = null;

fs.readFile(path.join(mainPath, process.env.RSA_PUBKEY)).then((data) => {
    pubKey = data.toSrting();
    priKey = fs.readFileSync(path.join(mainPath, process.env.RSA_PRIKEY)).toString();
}).err((e) => {
    const key = new NodeRSA({b: 2048});
    key.setOptions({ encryptionScheme: 'pkcs1' });
    pubKey = key.exportKey("pkcs8-public-pem");
    priKey = key.exportKey('pkcs8-private-pem');
    fs.writeSync(path.join(mainPath, process.env.RSA_PUBKEY, pubKey.toByte());
    fs.writeSync(path.join(mainPath, process.env.RSA_PRIKEY, priKey.toByte());
});

module.exports = { keys: { pubKey, priKey } };