const express = require('express');
const {pubKey,priKey} = require("../../utils/init").keys;
const router = express.Router();
const jwt = require('../../utils/jwt');
const {users} = require('../../utils/sql');
const crypto = require('crypto');
const {Hmac} = require("crypto");

const hmac = crypto.createHash('sha256', process.env.HMAC_KEY);

router.get('/getPubKey', function (req, res, next) {
    res.json({
        code: 0,
        message: 'ok',
        key: pubKey
    });
    res.end();
});

router.post('/login', function (req, res, next) {
    const inputCaptcha = req.body.captcha.toLowerCase();
    const email = req.body.email;
    if (inputCaptcha === req.session.captcha) {
            users.findOne({ where: { email  } })
            .then(function (user) {
                if(user === null) {
                    res.json({
                        code: -100,
                        msg: 'Cannot found this user, are you register?',
                    })
                } else {
                    let pw = crypto.privateDecrypt(priKey, Buffer.from(req.body.password, 'base64'));
                    let en = hmac.update(pw)
                    if (user.password !== en) {
                        res.json({
                            code: -101,
                            msg: 'You enter a wrong password,please check your password',
                        })
                    } else {
                        res.json({
                            code: 0,
                            msg: 'ok',
                            token: jwt.genToken({wd: 'nmd'})
                        })
                    }
                }
            });
    } else {
        res.json({
            code: -1,
            msg: 'Validation fails'
        });
    }
    req.session.captcha = "";
})
module.exports = router;