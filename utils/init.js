const path = require('path');
const fs = require('fs');

const mainPath = path.join(__dirname, '..');
const pubKey = fs.readFileSync(path.join(mainPath, process.env.RSA_PUBKEY)).toString();
const priKey = fs.readFileSync(path.join(mainPath, process.env.RSA_PRIKEY)).toString();

module.exports = {keys: {pubKey, priKey}};