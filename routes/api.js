/*
* ROUTING FOR API
*/

const Express = require('express');
const path = require('path');
const router = Express.Router();
const Database = require('../src/Database.js');

router.get('/search', (req, res) => {
    if(!req.query.term || req.query.term.length < 2) {
        console.log("No term!");
        res.send({});
    }
    else {
        find(req.query.term, res);
    }
});

router.get('/relic/:tier/:name', (req, res) => {
    getRelic(req.params.tier, req.params.name, "", res);
});

router.get('/mission/:node', (req, res) => {
    console.log(req.params.node);
    getMission(req.params.node, res);
});

router.get('*', (req, res) => {
    res.send("AHHHHH");
});

async function find(term, res) {
    let result = "";
    result = await Database.findItem(term);
    res.send(result);
}

async function getRelic(tier, name, rating="", res) {
    let result = {};
    result = await Database.getRelic(tier, name, rating);
    res.send(result);
}

async function getMission(node, res) {
    let result = {};
    result = await Database.getMissionTable(node);
    res.send(result);
}

module.exports = router;