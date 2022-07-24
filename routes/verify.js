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
    issuer: url.resolve(process.env.SITE_URL,'/verify/email/'),
    getToken: function (req) {
        if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }
}));

router.get('/email',function (req, res){
    let UUID = req.auth.uuid;
    let o = {
        title: siteName,
        done: false,
        name: 'Index',
        url: '/',
        time: 3,
        msg: 'This url already used.'//Verify email done.  Jump to the My page
    }
    users.findOne({where:{UUID}})
        .then(function (user){
            if(!user.email_verify) {
                user.email_verify = true;
                user.save();
                o = {
                    ...o,
                    name: 'My',
                    url: '/my',
                    msg: 'Verify email done.  Jump to the My page'
                }
            }
            res.render('verify/email', o)
    });
});
module.exports = router;
