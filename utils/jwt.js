const {keys} = require('./init');
const jwt = require('jsonwebtoken');
const url = require('url');

function genToken(payload, pa = '/', time = '12h') {
    return jwt.sign(payload, keys.priKey, {
        algorithm: "RS256",
        expiresIn: time,
        issuer: url.resolve(process.env.SITE_URL,pa)
    })
}

function checkToken(token, pa = '/') {

}
module.exports = {genToken, checkToken}