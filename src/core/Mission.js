const Database = require("./Database.js");

const functions = {
    getMission: async function(node) {
        try {
            let rows = await Database.getMission(node);
            if(!rows || !rows.length) {
                throw new Error("No mission found");
            }

            return rows[0];
        }
        catch (err) {
            throw err;
        }
    },
    getMissionTable: async function(node) {
        try {
            let rows = await Database.getMissionTable(node);
            let missionData = await functions.getMission(node);

            let mission = missionData ? missionData : {};

            if(rows[0].stage) {
                mission.reward_scheme = "stage";
            }
            else if(rows[0].rotation) {
                mission.reward_scheme = "rotation";
            }
            else {
                mission.reward_scheme = "single";
            }
            mission.drops = [];
            for(drop of rows) {
                mission.node = drop.source;
                mission.drops.push(drop);
            }

            return mission;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = functions;