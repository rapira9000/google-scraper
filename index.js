const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
require('./passport-setup');
const config = require('./config');
const pug = require('pug');

const observeApp = require('./utils/observeApp');

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());
app.use(morgan('dev'));
// For an actual app you should configure this with an experation time, better keys, proxy and secure
app.use(cookieSession({
    name: 'r9k-session',
    keys: ['key1', 'key2']
  }));

// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());
app.use('/public', express.static('public'));

// Example protected and unprotected routes;
const marketScrapper = require("./utils/marketScrapper");

const isLogIn = ((req, res, next) => {
    if (req?.user) {
        next();
    } else {
        res.status(401).send(pug.renderFile('./templates/logIn.pug', {
            user: req?.user
        }))
    }
});

app.get('/', isLogIn, async (req, res) => {
    const gMarketCategories = await marketScrapper.getGMarketCategory();
    const countries = marketScrapper.countries;
    const collections = marketScrapper.collections;
    const products = await marketScrapper.getProducts(req.query);
    const checkedProductsToObserve = observeApp.checkProducts({products, userId: req.user.id});

    res.send(pug.renderFile('./templates/home.pug', {
        user: req?.user,
        btnSearchDisabled: true,
        btnObserveDisabled: false,
        gMarketCategories,
        countries,
        collections,
        products: checkedProductsToObserve
    }))
});

app.get('/observe/', isLogIn, async (req, res) => {
    const products = observeApp.getObserveApp(req.user.id);
    const checkedProductsToObserve = observeApp.checkProducts({products, userId: req.user.id});
    res.send(pug.renderFile('./templates/observeApp.pug', {
        user: req?.user,
        btnSearchDisabled: false,
        btnObserveDisabled: true,
        products: checkedProductsToObserve
    }));
});

app.post('/observe-app/', isLogIn, async (req, res) => {
    if (req.body?.appId) {
        const responseData = req.body?.appEventType && req.body.appEventType === 'add'
            ? await observeApp.addObserveApp({
                appId: req.body.appId,
                userId: req.user.id
            })
            : await observeApp.removeObserveApp({
                appId: req.body.appId,
                userId: req.user.id
            });

        res.status(200).send({type: responseData})
    } else {
        res.writeHead(412).send({type: 'error', mess: 'appId required parameter!'});
    }
});

app.get('/failed', (req, res) => res.send('You Failed to log in!'));

// Auth Routes
app.get('/google/log-in', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
});

app.listen(config.port, () => console.log(`Listening on port ${config.port}!`))