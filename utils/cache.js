const NodeCache = require( "node-cache" );

const captcha = new NodeCache({ stdTTL: 30, checkperiod: 30 });
const emailVerify = new NodeCache({ stdTTL: 15*60, checkperiod: 120 });

module.exports = {
    captcha,emailVerify
}