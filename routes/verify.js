const express = require('express');
const router = express.Router();
const {expressjwt} = require("express-jwt");
const {keys} = require("../utils/init");
const {users} = require('../utils/sql');
const {emailVerify} = require('../utils/cache');
const url = require("url");
const createError = require("http-errors");

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

router.get('/email',function (req, res,next){
    let UUID = req.auth.uuid;
    let o = {
        title: siteName,
        done: false,
        name: 'Index',
        url: '/',
        time: 3,
        msg: 'This url already used.'//Verify email done.  Jump to the My page
    }
    if(UUID) {
        users.findOne({where: {UUID}})
            .then(function (user) {
                if (!user.email_verify) {
                    user.email_verify = true;
                    user.save();
                    o = {
                        ...o,
                        name: 'My',
                        url: '/my',
                        msg: 'Verify email done.  Jump to the My page'
                    }
                }
                res.render('verify/email', o)
            });
    } else {
        next(createError(401))
    }
});

router.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        let o = {
            title: siteName,
            done: false,
            name: 'Index',
            url: '/',
            time: 3,
            msg: 'Token invalid.'
        }
        res.render('verify/email', o)
    } else {
        next(err);
    }
})
module.exports = router;
