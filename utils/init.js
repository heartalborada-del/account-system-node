const path = require('path');
const fs = require('fs');
const NodeRSA = require("node-rsa");
const dir = require("../utils/dir");
const util = require('node:util');

const mainPath = path.join(__dirname, '..');
const keyPath = path.join(mainPath, process.env.KEY_PATH);
let flag = false;
let pubKey = null, priKey = null;
try {
    fs.statSync(path.join(keyPath, process.env.RSA_PUBKEY));
    fs.statSync(path.join(keyPath, process.env.RSA_PRIKEY));
} catch {
    flag = true;
}
if (flag) {
    dir.mkdirsSync(keyPath);
    var key = new NodeRSA({ b: 2048 });
    key.setOptions({ encryptionScheme: 'pkcs1' });
    pubKey = key.exportKey("pkcs8-public-pem");
    priKey = key.exportKey('pkcs8-private-pem');
    fs.writeFileSync(path.join(keyPath, process.env.RSA_PUBKEY), pubKey, { encoding: 'utf8' });
    fs.writeFileSync(path.join(keyPath, process.env.RSA_PRIKEY), priKey, { encoding: 'utf8' });
} else {
    pubKey = fs.readFileSync(path.join(keyPath, process.env.RSA_PUBKEY)).toString();
    priKey = fs.readFileSync(path.join(keyPath, process.env.RSA_PRIKEY)).toString();
}

module.exports = { keys: { pubKey, priKey } };