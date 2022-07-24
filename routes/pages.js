const express = require('express');
const router = express.Router();
const {expressjwt} = require("express-jwt");
const {keys} = require("../utils/init");
const {users} = require('../utils/sql');

const siteName = 'TEST';

router.use(expressjwt({
    secret: keys.priKey,
    algorithms: ['RS256'],
    credentialsRequired: false,
    //issuer: process.env.SITE_URL,
    getToken: function (req) {
        if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
            return req.headers.authorization.split(" ")[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        } else if (req.cookies && req.cookies.ltoken) {
            return req.cookies.ltoken;
        }
        return null;
    }
}).unless({
    path: ['/','/login','/register']
}));

router.get('/', function (req, res, next) {
    res.render('index', {title: siteName});
});

router.get('/login', function (req, res, next) {
    res.render('account/login', {title: siteName});
})

router.get('/register', function (req, res, next) {
    res.render('account/register', {title: siteName});
})

router.get('/my', function (req, res, next){
    if(req.auth && req.auth.uuid){
        users.findOne({where:{UUID: req.auth.uuid}})
            .then(function (user){
                res.render('account/my', {
                    title: siteName,
                    UUID: req.auth.uuid,
                    email: user.email
                });
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

/*router.get('/test', function (req, res, next){

})*/
module.exports = router;
