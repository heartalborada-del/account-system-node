const express = require('express');
const {v1: uuid,v5: uuid5} = require('uuid');
const crypto = require('crypto');

const {pubKey, priKey} = require("../../utils/init").keys;
const jwt = require('../../utils/jwt');
const jwt1 = require('jsonwebtoken');
const {users} = require('../../utils/sql');
const mail = require('../../utils/email');
const url = require("url");
const {keys} = require("../../utils/init");

const {captcha:captchaCache} = require('../../utils/cache');

const router = express.Router();

const reg = [
    /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
    /^(?=.*[a-zA-Z])(?=.*[0-9])[\x00-\xff][^:;'",\s]{8,20}$/
];

router.get('/getPubKey', function (req, res) {
    res.json({
        code: 0,
        message: 'ok',
        key: pubKey
    });
    res.end();
});

router.post('/login', function (req, res) {
    if(!(req.body || req.body.captcha || req.body.email || req.body.password)){
        return res.json({
            code: -101,
            msg: 'Invalid params',
        });
    }
    const inputCaptcha = req.body.captcha.toLowerCase();
    const email = req.body.email;
    if (!reg[0].test(email)) {
        return res.json({
            code: -101,
            msg: 'You enter a wrong email,please check your password',
        });
    }
    if (inputCaptcha === req.session.captcha && captchaCache.has(req.session.captcha)) {
        users.findOne({where: {email}})
            .then(function (user) {
                if (user === null) {
                    return res.json({
                        code: -100,
                        msg: 'Cannot found this user, are you register?',
                    });
                } else {
                    let pw = crypto.privateDecrypt({
                        key: priKey,
                        padding: crypto.constants.RSA_PKCS1_PADDING
                    }, Buffer.from(req.body.password, 'base64'));
                    let hmac = crypto.createHash('sha256', process.env.HMAC_KEY);
                    let en = hmac.update(pw).digest('hex');
                    if (user.password !== en || !reg[1].test(pw.toString())) {
                        return res.json({
                            code: -101,
                            msg: 'You enter a wrong password,please check your password',
                        });
                    } else {
                        let token = jwt.genToken({'uuid': user.UUID});
                        return res.cookie('ltoken', token, {maxAge: 12 * 3600 * 1000})
                            .json({
                                code: 0,
                                msg: 'ok',
                                token
                            });
                    }
                }
            });
    } else {
        return res.json({
            code: -1,
            msg: 'Validation fails'
        });
    }
    if(!req.session.captcha) {
        captchaCache.take(req.session.captcha);
        return req.session.captcha = "";
    }
});

router.post('/register', function (req, res) {
    if(!(req.body || req.body.captcha || req.body.email || req.body.password)){
        return res.json({
            code: -101,
            msg: 'Invalid params',
        });
    }
    const inputCaptcha = req.body.captcha.toLowerCase();
    const email = req.body.email;
    if (!reg[0].test(email)) {
        return res.json({
            code: -101,
            msg: 'You enter a wrong email,please check your email',
        });
    }
    if (inputCaptcha === req.session.captcha && captchaCache.has(req.session.captcha)) {
        let pw = crypto.privateDecrypt({
            key: priKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
        }, Buffer.from(req.body.password, 'base64'));
        let hmac = crypto.createHash('sha256', process.env.HMAC_KEY);
        let en = hmac.update(pw).digest('hex');
        if (!reg[1].test(pw.toString())) {
            return res.json({
                code: -101,
                msg: 'You enter a wrong password,please check your password',
            })
        } else {
            users.findOne({where: {email}}).then(function (user) {
                if (user == null) {
                    let U = uuid();
                    U = uuid5(en,U);
                    users.build({
                        UUID: U,
                        email,
                        password: en
                    }).save().then(function () {
                        let token = jwt.genToken({uuid: U});
                        let tokena = jwt.genToken({uuid: U, usage: 'emailVerify'}, '/verify/email/', '15m');
                        mail.sendVerifyEmail(email, tokena);
                        return res.cookie('ltoken', token, {maxAge: 12 * 3600 * 1000}).json({
                                code: 0,
                                msg: 'ok',
                                token
                            });
                    });
                } else {
                    return res.json({
                        code: -101,
                        msg: 'This email has already use, please use other emails',
                    })
                }
            });
        }
    } else {
        res.json({
            code: -1,
            msg: 'Validation fails'
        });
    }
    if(!req.session.captcha) {
        captchaCache.take(req.session.captcha);
        req.session.captcha = "";
    }
});

router.post('/emailVerify', function (req, res) {
    if(!(req.body || req.body.captcha)){
        return res.json({
            code: -101,
            msg: 'Invalid params',
        });
    }
    const uuid = req.auth.uuid;
    const inputCaptcha = req.body.captcha.toLowerCase();
    let isE = false;
    if (inputCaptcha === req.session.captcha && captchaCache.has(req.session.captcha)) {
        users.findOne({where: {uuid}}).then(function (user) {
            if (user.email_verify) {
                res.json({
                    code: -110,
                    msg: 'This email has already verify',
                });
            } else if (req.cookies && req.cookies.etoken) {
                jwt1.verify(req.cookies.etoken, keys.pubKey, {
                    algorithm: "RS256",
                    issuer: url.resolve(process.env.SITE_URL, '/')
                }, function (err, payload) {
                    let t = (payload.time - Date.now()) / 1000 + 300;
                    if (payload.time + 300 * 1000 > Date.now()) {
                        res.json({
                            code: -102,
                            msg: 'Please Wait for ' + Math.round(t).toString() + ' second(s) before you can resend the verification email.',
                            wait_time: Math.round(t)
                        });
                        isE = true;
                    }
                })
            }
            if(!isE) {
                let token = jwt.genToken({uuid, usage: 'emailVerify'}, '/verify/email/', '15m');
                res.cookie('etoken', jwt.genToken({time: Date.now()}, '/', '15m'), {maxAge: 15 * 60 * 1000});
                mail.sendVerifyEmail(user.email, token);
                res.json({
                    code: 0,
                    msg: 'The message has been sent, please check your mailbox.',
                });
            }
        })
    } else {
        res.json({
            code: -1,
            msg: 'Validation fails'
        });
    }
    if(!req.session.captcha) {
        captchaCache.take(req.session.captcha);
        req.session.captcha = "";
    }
});

router.post('/resetPassword', function(req, res) {
    if(!(req.body || req.body.captcha || req.body.email)){
        return res.json({
            code: -101,
            msg: 'Invalid params',
        });
    }
    const inputCaptcha = req.body.captcha.toLowerCase();
    const email = req.body.email;
    let p = {"email": email}
    if (inputCaptcha === req.session.captcha && captchaCache.has(req.session.captcha)) {
        users.findOne({where: p}).then(function (user) {
            if(user === null ) {
                return res.json({
                    code: -100,
                    msg: 'Cannot found this user, are you register?',
                });
            } else {
                let token = jwt.genToken({uuid: user.uuid, usage: 'resetPassword'}, '/verify/email/', '15m');
                mail.sendRsPWEmail(user.email, token);
                res.json({
                    code: 0,
                    msg: 'The reset mail has been sent, please check your mailbox.',
                });
            }
        })
    }
})
module.exports = router;