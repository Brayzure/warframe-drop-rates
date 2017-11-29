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
const partialViewDir = path.join(__dirname, "..", "lib/partials");

router.get("/", (req, res) => {
    res.redirect("./search");
});

router.get("/search", (req, res) => {
    res.sendFile("search/search.html", {root: path.join(__dirname, "..", "public/views")});
});

router.get("/relics/:tier/:name", async (req, res) => {
    try {
        let tier = req.params.tier;
        let name = req.params.name;
        let relic = await Interface.getRelic(tier, name, true);
        let intact = pug.renderFile(
            path.join(rootViewDir, "relics/relicTable.pug"),
            {
                drops: relic.intact
            }
        )
        let exceptional = pug.renderFile(
            path.join(rootViewDir, "relics/relicTable.pug"),
            {
                drops: relic.exceptional
            }
        )
        let flawless = pug.renderFile(
            path.join(rootViewDir, "relics/relicTable.pug"),
            {
                drops: relic.flawless
            }
        )
        let radiant = pug.renderFile(
            path.join(rootViewDir, "relics/relicTable.pug"),
            {
                drops: relic.radiant
            }
        )

        res.render("relics/relics.ejs", {
            relic: relic.relic_name,
            intact,
            exceptional,
            flawless,
            radiant
        });
    }
    catch (err) {
        console.log(err);
        if(err.message === "Relic doesn't exist.") {
            res.sendStatus(404);
        }
        else {
            res.sendStatus(500);
        }
    }
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
                path.join(partialViewDir, "/dropTable.pug"),
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