const express = require('express');
const router = express.Router();
const {expressjwt} = require("express-jwt");
const {keys} = require("../utils/init");
const {users} = require('../utils/sql');
const url = require("url");

const siteName = process.env.SITE_NAME;

router.use(expressjwt({
    secret: keys.priKey,
    algorithms: ['RS256'],
    credentialsRequired: false,
    issuer: url.resolve(process.env.SITE_URL, '/'),
    getToken: function (req) {
        if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
            return req.headers.authorization.split(" ")[1];
        } else if (req.cookies && req.cookies.ltoken) {
            return req.cookies.ltoken;
        }
        return null;
    }
}).unless({
    path: ['/', '/login', '/register']
}));

router.get('/', function (req, res) {
    res.render('index', {title: siteName});
});

router.get('/login', function (req, res) {
    res.render('account/login', {title: siteName});
})

router.get('/register', function (req, res) {
    res.render('account/register', {title: siteName});
})

router.get('/my', function (req, res) {
    if (req.auth && req.auth.uuid) {
        users.findOne({where: {UUID: req.auth.uuid}})
            .then(function (user) {
                if (user != null) {
                    res.render('account/my', {
                        title: siteName,
                        UUID: req.auth.uuid,
                        email: user.email,
                        verify: user.email_verify
                    });
                } else {
                    let option = {
                        name: 'Login',
                        url: '/login',
                        time: 5,
                        message: 'You aren\'t login or register'
                    }
                    res.cookie('ltoken', '', {maxAge: 0})
                        .cookie('etoken', '', {maxAge: 0})
                        .render('jump', option);
                }
            })
    } else {
        let option = {
            name: 'Login',
            url: '/login',
            time: 5,
            message: 'You aren\'t login or register'
        }
        res.render('jump', option);
    }
})

router.use(function (err, req, res, next){
    if(err){
        next(err);
    }
})
module.exports = router;
