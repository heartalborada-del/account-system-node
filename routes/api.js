const express = require('express');
const router = express.Router();
const accRouter = require('./api/account');
const captchaRouter = require('./api/captcha');
const {expressjwt} = require('express-jwt');
const keys = require("../utils/init").keys;

router.use('/acc', accRouter);

router.use('/captcha', captchaRouter);

router.use(expressjwt({
    secret: keys.priKey,
    algorithms: ['RS256'],
    credentialsRequired: true
}).unless({
    path: ['/captcha', '/acc/login', '/acc/getPubKey']
}));

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
