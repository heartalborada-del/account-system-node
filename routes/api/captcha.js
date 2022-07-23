const express = require('express');
const router = express.Router();
const captcha = require('svg-captcha');

router.get('/', function (req, res, next) {
    let c = captcha.create({
        size: 4,
        ignoreChars: '0o0iIl1',
        noise: 4,
        color: true,
        height: '30',
        width: '100',
        background: '#fff'
    })
    req.session.captcha = c.text.toLowerCase();
    res.setHeader("content-type", 'image/svg+xml')
    res.send(c.data);
    res.end();
});

module.exports = router;