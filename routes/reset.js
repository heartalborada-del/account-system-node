const express = require('express');
const router = express.Router();
const {expressjwt} = require("express-jwt");
const {keys} = require("../utils/init");
const {emailVerify} = require('../utils/cache');
const url = require("url");

const siteName = process.env.SITE_NAME;

router.use(expressjwt({
    secret: keys.priKey,
    algorithms: ['RS256'],
    credentialsRequired: false,
    issuer: url.resolve(process.env.SITE_URL,'/verify/email/'),
    getToken: function (req) {
        if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    },
    isRevoked: function (req, token){
        if (token.payload && token.payload.uuid) {
            return !emailVerify.has(req.query.token.toString());
        }
        return true;
    }
}));

router.get('/password', function (req, res) {
    res.render('reset/resetPw', {title: siteName});
})

module.exports = router;