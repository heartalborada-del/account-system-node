const {keys} = require('./init');
const jwt = require('jsonwebtoken');

function genToken(payload) {
    return jwt.sign(payload, keys.priKey, {
        algorithm: "RS256",
        expiresIn: '12h',
        //issuer: process.env.SITE_URL
    })
}

function checkToken(token) {
    return jwt.verify(token, keys.pubKey, {
        issuer: process.env.SITE_URL
    })
}
module.exports = {genToken, checkToken}