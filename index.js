const fs = require('fs');
const http = require('http');
const https = require('https');
const Express = require('express');
const ejs = require('ejs');
const Database = require('./src/Database.js');
const RateLimiter = require('./src/RateLimiter.js');



const app = Express();
const ratelimit = new RateLimiter(10, 10);

let api = require('./routes/api.js');
//let web = require('./routes/web.js');

app.use(logRequests);
app.use(allowCrossDomain);
app.use('/api', checkRateLimit);

// API handling
//app.use('/api', rejectInsecure);
app.use('/api', api);

// Web handling
//app.use('/', web);

app.get('*', (req, res) => {
    res.send("Super Fancy 404");
});

let httpServer = http.createServer(app);
httpServer.listen(3000, 'localhost', () => {
    console.log("Insecure web server now ready to receive requests");
});

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