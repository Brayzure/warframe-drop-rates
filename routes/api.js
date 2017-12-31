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
        send500(res);
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
                message: "No relics found. Wait, that can't be right...",
                description: "An internal error was encountered when attempting to retrieve all relics."
            });
        }
    }
    catch (e) {
        send500(res);
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
        send500(res);
        console.log(e);
    }
});

router.get('/missions', async (req, res) => {
    try {
        let result = {};
        result = await Interface.getAllMissions();
        if(result) {
            res.send(result);
        }
        else {
            res.status(500).send({
                status: 500,
                message: "No missions found. Wait, that can't be right...",
                description: "An internal error was encountered when attempting to retrieve all missions."
            });
        }
    }
    catch (e) {
        send500(res);
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
        send500(res);
        console.log(e);
    }
});

router.get('/enemies', async (req, res) => {
    try {
        let result = {};
        result = await Interface.getAllEnemies();
        if(result) {
            res.send(result);
        }
        else {
            res.status(500).send({
                status: 500,
                message: "No enemies found. Wait, that can't be right...",
                description: "An internal error was encountered when attempting to retrieve all enemies."
            });
        }
    }
    catch (e) {
        send500(res);
        console.log(e);
    }
});

router.get('/enemies/:name', async (req, res) => {
    try {
        let result = {};
        result = await Interface.getEnemy(req.params.name);
        if(result) {
            res.send(result);
        }
        else {
            res.status(404).send({
                status: 404,
                message: "Enemy not found",
                description: "You attempted to access an enemy that either doesn't exist, or has no rewards."
            });
        }
    }
    catch (e) {
        send500(res);
        console.log(e);
    }
});

router.get('*', (req, res) => {
    res.sendStatus(404);
});

function send500(res) {
    res.status(500).send({
        status: 500,
        message: "We broke something, but we're not sure what went wrong.",
        description: "An unknown internal error was encountered. Please report this, with as much detail as possible."
    });
}

module.exports = router;