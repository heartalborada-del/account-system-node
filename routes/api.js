const express = require('express');
const router = express.Router();

const accRouter = require('./api/account');
const captchaRouter = require('./api/captcha');
const avatarRouter = require('./api/avatar');
const adminRouter = require('./api/admin');

const {expressjwt} = require('express-jwt');
const url = require("url");
const keys = require("../utils/init").keys;

router.use(expressjwt({
    secret: keys.priKey,
    algorithms: ['RS256'],
    credentialsRequired: true,
    issuer: url.resolve(process.env.SITE_URL,'/'),
    getToken: function (req) {
        if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
            return req.headers.authorization.split(" ")[1];
        } else if (req.cookies && req.cookies.ltoken) {
            return req.cookies.ltoken;
        }
        return null;
    }
}).unless({
    path: ['/api/captcha', '/api/acc/login', '/api/acc/getPubKey', '/api/acc/register']
}));

router.use('/acc', accRouter);

router.use('/captcha', captchaRouter);

router.use('/avatar', avatarRouter);

router.use('/admin', adminRouter);

router.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        let map = {
            'credentials_bad_scheme': -11,
            'credentials_bad_format': -45,
            'credentials_required': -14,
            'invalid_token': -19,
            'revoked_token': -19
        };
        res.status(401).json({
            code: map[err.code] || -810,
            msg: err.message
        });
    } else {
        next(err);
    }
})

module.exports = router;
