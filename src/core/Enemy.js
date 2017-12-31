const Database = require("./Database.js");

const functions = {
    getEnemy: async function(name) {
        try {
            let rows = await Database.getEnemy(name);
            if(!rows || !rows.length) {
                return {};
            }

            let enemy = {
                name: rows[0].name,
                mod_drop_chance: rows[0].mod_drop_chance,
                blueprint_drop_chance: rows[0].blueprint_drop_chance,
                mods: [],
                blueprints: []
            }

            for(reward of rows) {
                let type = reward.type.slice(6) + "s";
                enemy[type].push({
                    item_name: reward.item_name,
                    chance: reward.chance
                });
            }

            return enemy;
        }
        catch (err) {
            throw err;
        }
    },
    getAllEnemies: async function() {
        try {
            let rows = await Database.getAllEnemies();
            return rows;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = functions;