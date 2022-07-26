const express = require('express');
const router = express.Router();
const captcha = require('svg-captcha');

const {captcha:cache} = require('../../utils/cache');

router.get('/', function (req, res) {
    let c = captcha.create({
        size: 4,
        ignoreChars: '0o0iIl1',
        color: true,
        noise: 10,
        height: 30,
        background: '#cc9966'
    })
    req.session.captcha = c.text.toLowerCase();
    cache.set(c.text.toLowerCase(),c.text,30);
    res.setHeader("content-type", 'image/svg+xml')
    res.send(c.data);
    res.end();
});

module.exports = router;