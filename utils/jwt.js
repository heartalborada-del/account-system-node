const {keys} = require('./init');
const jwt = require('jsonwebtoken');

function genToken(payload) {
    return jwt.sign(payload, keys.priKey, {
        algorithm: "RS256",
        expiresIn: '24h',
        issuer: process.env.SITE_URL
    })
}

module.exports = {genToken}