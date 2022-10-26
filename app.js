const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/pages');
const usersRouter = require('./routes/api');
const verifyRouter = require('./routes/verify');
const resetRouter = require('./routes/reset');

const session = require("express-session");
const {expressjwt} = require("express-jwt");
const {keys} = require("./utils/init");
const url = require("url");
const {users} = require("./utils/sql");

const app = express();

const siteName = process.env.SITE_NAME;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session({
    name: "s",
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET, //wdnmd (
    cookie: {
        maxAge: 30 * 1000
    }
}));

app.use(expressjwt({
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
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', usersRouter);
app.use('/verify', verifyRouter);
app.use('/reset', resetRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);

    if (req.auth && req.auth.uuid) {
        users.findOne({where: {UUID: req.auth.uuid}})
            .then(function (user) {
                if (user != null) {
                    res.render('error', {
                        title: siteName,
                        permission: user.permission
                    });
                    return;
                }
            })
    } else {
        res.render('error', {title: siteName});
    }
});

module.exports = app;
