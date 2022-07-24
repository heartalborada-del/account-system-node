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
    const inputCaptcha = req.body.captcha.toLowerCase();
    const email = req.body.email;
    if (!reg[0].test(email)) {
        res.json({
            code: -101,
            msg: 'You enter a wrong email,please check your password',
        });
        res.end();
    }
    if (inputCaptcha === req.session.captcha) {
        users.findOne({where: {email}})
            .then(function (user) {
                if (user === null) {
                    res.json({
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
                        res.json({
                            code: -101,
                            msg: 'You enter a wrong password,please check your password',
                        });
                    } else {
                        let token = jwt.genToken({'uuid': user.UUID});
                        res.cookie('ltoken', token, {maxAge: 12 * 3600 * 1000}).json({
                            code: 0,
                            msg: 'ok',
                            token: token
                        });
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
});

router.post('/register', function (req, res) {
    const inputCaptcha = req.body.captcha.toLowerCase();
    const email = req.body.email;
    if (!reg[0].test(email)) {
        res.json({
            code: -101,
            msg: 'You enter a wrong email,please check your email',
        });
        res.end();
        return;
    }
    if (inputCaptcha === req.session.captcha) {
        let pw = crypto.privateDecrypt({
            key: priKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
        }, Buffer.from(req.body.password, 'base64'));
        let hmac = crypto.createHash('sha256', process.env.HMAC_KEY);
        let en = hmac.update(pw).digest('hex');
        if (!reg[1].test(pw.toString())) {
            res.json({
                code: -101,
                msg: 'You enter a wrong password,please check your password',
            })
        } else {
            users.findOne({where: {email}}).then(function (user) {
                if (user == null) {
                    let U = uuid();
                    users.build({
                        UUID: uuid5(en,U),
                        email,
                        password: en
                    }).save().then(function () {
                        let token = jwt.genToken({uuid: U});
                        let tokena = jwt.genToken({uuid, usage: 'emailVerify'}, '/verify/email/', '15m');
                        let url1 = url.resolve(process.env.SITE_URL, `/verify/email?token=${tokena}`);
                        mail.sendVerifyEmail(email, url1);
                        res.cookie('ltoken', token, {maxAge: 12 * 3600 * 1000})
                            .cookie('etoken', jwt.genToken({time: Date.now()}, '/', '15m'), {maxAge: 15 * 60 * 1000})
                            .json({
                                code: 0,
                                msg: 'ok',
                                token
                            });
                        res.end();
                    });
                } else {
                    res.json({
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
    req.session.captcha = "";
});

router.post('/emailVerify', function (req, res) {
    const uuid = req.auth.uuid;
    users.findOne({where: {uuid}}).then(function (user) {
        if (user.email_verify) {
            res.json({
                code: -110,
                msg: 'This email has already verify',
            });
            res.end();
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
                    res.end();

                }
            })
            return;
        }
        let token = jwt.genToken({uuid, usage: 'emailVerify'}, '/verify/email/', '15m');
        let url1 = url.resolve(process.env.SITE_URL, `/verify/email?token=${token}`);
        res.cookie('etoken', jwt.genToken({time: Date.now()}, '/', '15m'), {maxAge: 15 * 60 * 1000});
        mail.sendVerifyEmail(user.email, url1);
        res.json({
            code: 0,
            msg: 'The message has been sent, please check your mailbox.',
        });
        res.end();
    })
});

module.exports = router;