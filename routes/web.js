/*
* ROUTING FOR WEB
*/

const Express = require('express');
const path = require('path');
const router = Express.Router();
const Interface = require('../src/Interface.js');
const utils = require('../src/utils.js');
const ejs = require('ejs');
const pug = require('pug');

const rootViewDir = path.join(__dirname, "..", "lib/views");

router.get("/search", (req, res) => {
    res.sendFile("search/search.html", {root: path.join(__dirname, "..", "public/views")});
});

router.get("/missions/:node", async (req, res) => {
    try {
        let node = decodeURIComponent(req.params.node);
        let dropTable = await Interface.getMissionTable(node);
        if(!dropTable) {
            res.sendStatus(404);
        }
        else {
            let drops = dropTable.drops;

            if(dropTable.reward_scheme === "rotation") {
                drops = utils.splitByRotation(dropTable.drops);
            }

            let html = pug.renderFile(
                path.join(rootViewDir, "missions/dropTable.pug"),
                {
                    drops: drops
                }
            )
            res.render("missions/missions.ejs", {
                pug: html,
                mission: dropTable.node
            });
        }
        
    }
    catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.get("*", (req, res) => {
    res.sendStatus(404);
});

module.exports = router;