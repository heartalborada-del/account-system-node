const express = require('express');
const router = express.Router();
const siteName = 'TEST'

router.get('/', function (req, res, next) {
    res.render('index', {title: siteName});
});

router.get('/login', function (req, res, next) {
    res.render('login', {title: siteName});
})

router.get('/register', function (req, res, next) {
    res.render('register', {title: siteName});
})

module.exports = router;
