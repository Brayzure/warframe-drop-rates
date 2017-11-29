/*
* ROUTING FOR API
*/

const Express = require('express');
const path = require('path');
const router = Express.Router();
const Interface = require('../src/Interface.js');

router.get('/search', async (req, res) => {
    try {
        if(!req.query.term || req.query.term.length < 2) {
            //console.log("No term!");
            res.send({});
        }
        else {
            let result = "";
            result = await Interface.findItem(req.query.term);
            //console.log(result);
            res.send(result);
        }
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
    
});

router.get('/relics/:tier/:name', async (req, res) => {
    try {
        let result = {};
        let verbose = false;
        if(req.query.v && req.query.v === "true") {
            verbose = true;
        }
        result = await Interface.getRelic(req.params.tier, req.params.name, verbose);
        if(result) {
            res.send(result);
        }
        else {
            res.status(404).send({
                status: 404,
                message: "Relic not found",
                description: "You attempted to access a relic that is not present in the drop tables."
            });
        }
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
});

router.get('/relics', async (req, res) => {
    try {
        let result = {};
        let verbose = true;
        result = await Interface.getAllRelics(verbose);
        if(result) {
            res.send(result);
        }
        else {
            res.status(500).send({
                status: 500,
                message: "Unable to retrieve relics",
                description: "An internal error was encountered when attempting to retrieve all relics."
            });
        }
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
});

router.get('/missions/:node', async (req, res) => {
    try {
        let result = {};
        result = await Interface.getMissionTable(req.params.node);
        if(result) {
            res.send(result);
        }
        else {
            res.status(404).send({
                status: 404,
                message: "Mission not found",
                description: "You attempted to access a mission that either doesn't exist, or has no rewards."
            });
        }
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
});

router.get('*', (req, res) => {
    res.sendStatus(404);
});

module.exports = router;