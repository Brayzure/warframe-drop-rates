const certLoc = '/etc/letsencrypt/live/lessis.moe/';

const fs = require('fs');
const http = require('http');
const https = require('https');
const Express = require('express');
const ejs = require('ejs');
const Database = require('./src/Database.js');
const RateLimiter = require('./src/RateLimiter.js');

let secure = true;
try {
    var options = {
        key: fs.readFileSync(certLoc + 'privkey.pem'),
        cert: fs.readFileSync(certLoc + 'fullchain.pem')
    }
}
catch (err) {
    secure = false;
}


const app = Express();
const ratelimit = new RateLimiter(10, 10);

let api = require('./routes/api.js');
//let web = require('./routes/web.js');

app.use(logRequests);
app.use(allowCrossDomain);
app.use('/api', checkRateLimit);
if(secure) {
    app.use(ensureSecure);
}

// API handling
//app.use('/api', rejectInsecure);
app.use('/api', api);

// Web handling
//app.use('/', web);

app.get('*', (req, res) => {
    res.send("AHHHHH");
});

if(secure) {
    let httpsServer = https.createServer(options, app);
    httpsServer.listen(4000, () => {
        console.log("Secure web/API server now ready to receive requests");
    });
}

let httpServer = http.createServer(app);
httpServer.listen(3000, () => {
    console.log("Insecure web server now ready to receive requests");
});

function rejectInsecure(req, res, next) {
    if(!req.secure) {
        res.sendStatus(403);
    }

    return next();
}

function logRequests(req, res, next) {
    let term = "";
    if(req.query.term) {
        term = req.query.term;
    }
    Database.addLog(req.ip, req.path, term);

    next();
}

function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');

    next();
}

function ensureSecure(req, res, next) {
    if(req.secure) {
        return next();
    }

    res.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.redirect('https://' + req.hostname + req.url);
}

function checkRateLimit(req, res, next) {
    console.log("New request, checking ratelimits...");
    if(ratelimit.consume(req.ip)) {
        let details = ratelimit.getDetails(req.ip);
        let time = Math.ceil((details.reset - new Date().getTime()) / 1000);
        res.header("X-RateLimit-Limit", details.maxTokens);
        res.header("X-RateLimit-Remaining", details.tokens);
        res.header("X-RateLimit-Reset", time);
        next();
    }
    else {
        let details = ratelimit.getDetails(req.ip);
        let time = Math.ceil((details.reset - new Date().getTime()) / 1000);
        res.header("X-RateLimit-Limit", details.maxTokens);
        res.header("X-RateLimit-Remaining", details.tokens);
        res.header("X-RateLimit-Reset", time);
        res.sendStatus(429);
    }
}