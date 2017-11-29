const postgres = require('pg');

const auth = require('../../auth/auth.json');

var pg = new postgres.Client({
    user: auth.pg_user,
    password: auth.pg_password,
    database: auth.pg_db
});

pg.connect((err) => {
    if(err) {
        throw err;
    }
});

const functions = {
    /*
    * Properties
    * reward.source - where the item drops from (node or enemy name)
    * reward.reward_type - one of single, rotation, enemy_mod, enemy_blueprint, sortie 
    * reward.rotation - rotation, if applicable
    * reward.chance - how likely the item is to be rewarded, assuming a reward is furnished
    * reward.item - name of the item
    */
    addReward: async function(reward) {
        try {
            let result = await pg.query({
                text: "INSERT INTO rewards VALUES($1, $2, $3, $4, $5) RETURNING *",
                values: [reward.source, reward.reward_type, reward.rotation, reward.chance, reward.item]
            });

            return result;
        }
        catch (err) {
            throw err;
        }
    },
    /*
    * Properties
    * relic.tier - one of axi, neo, meso, lith
    * relic.name - name of the relic (A2, for example)
    * relic.rating - one of intact, exceptional, flawless, radiant
    * relic.item - the dropped item
    * relic.chance - chance item is dropped
    * relic.vaulted - if the relic is vaulted
    */
    addRelic: async function(relic) {
        try {
            let result = await pg.query({
                text: "INSERT INTO relics VALUES($1, $2, $3, $4, $5) RETURNING *",
                values: [relic.tier, relic.name, relic.rating, relic.item, relic.chance]
            });

            return result;
        }
        catch (err) {
            throw err;
        }
    },
    /*
    * Properties
    * enemy.name - enemy name
    * enemy.mod_drop_chance - chances the enemy will drop a mod
    * enemy.blueprint_drop_chance - chances the enemy will drop a blueprint
    * Note: The two above are chosen independently of each other
    */
    addEnemy: async function(enemy) {
        try {
            let result;
            if(enemy.mod_drop_chance) {
                result = await pg.query({
                    text: "INSERT INTO enemies VALUES($1, $2, $3) ON CONFLICT (name) DO UPDATE SET mod_drop_chance = $2 RETURNING *",
                    values: [enemy.name, enemy.mod_drop_chance, 0]
                });
            }
            if(enemy.blueprint_drop_chance) {
                result = await pg.query({
                    text: "INSERT INTO enemies VALUES($1, $2, $3) ON CONFLICT (name) DO UPDATE SET blueprint_drop_chance = $3 RETURNING *",
                    values: [enemy.name, 0, enemy.blueprint_drop_chance]
                });
            }

            return result;
        }
        catch (err) {
            throw err;
        }
    },
    /*
    * Properties
    * mission.node - name of the mission node
    * mission.sector - planet or other region the node is located in
    * mission.mission_type - type of mission
    * mission.event - boolean, whether the mission was part of an event
    */
    addMission: async function(mission) {
        try {
            let result = await pg.query({
                text: "INSERT INTO missions VALUES($1, $2, $3, $4) RETURNING *",
                values: [mission.node, mission.sector, mission.mission_type, mission.event]
            });

            return result;
        }
        catch (err) {
            throw err;
        }
    },
    removeMission: async function(node) {
        try {
            await pg.query({
                text: "DELETE FROM missions WHERE node ILIKE $1",
                values: [node]
            });

            return;
        }
        catch (err) {
            throw err;
        }
    },
    removeEnemy: async function(name) {
        try {
            await pg.query({
                text: "DELETE FROM enemies WHERE name ILIKE $1",
                values: [name]
            });

            return;
        }
        catch (err) {
            throw err;
        }
    },
    removeReward: async function(item) {
        try {
            await pg.query({
                text: "DELETE FROM rewards WHERE item_name ILIKE $1",
                values: [item]
            });

            return;
        }
        catch (err) {
            throw err;
        }
    },
    /*
    * TODO: Change return value to array of Drop resources
    */
    findItem: async function(item, exact=false) {
        try {
            if(item.length < 1) {
                return [];
            }

            let result, relicResult;
            result = await pg.query({
                text: `SELECT * FROM rewards WHERE item_name ILIKE ${exact?"$1":"'%' || $1 || '%'"} ORDER BY item_name, chance DESC`,
                values: [item]
            });

            if(exact) {
                relicResult = await pg.query({
                    text: "SELECT tier, name, rating, item_name, chance, NOT EXISTS(SELECT * FROM rewards WHERE item_name = relics.tier || ' ' || relics.name || ' Relic') AS vaulted FROM relics WHERE item_name ILIKE $1 ORDER BY vaulted, item_name, tier, name, chance DESC",
                    values: [item]
                });
            }
            else {
                relicResult = await pg.query({
                    text: "SELECT tier, name, rating, item_name, chance, NOT EXISTS(SELECT * FROM rewards WHERE item_name = relics.tier || ' ' || relics.name || ' Relic') AS vaulted FROM relics WHERE item_name ILIKE '%' || $1 || '%' ORDER BY vaulted, item_name, tier, name, chance DESC",
                    values: [item]
                });
            }

            return {rewards: result.rows, relics: relicResult.rows};
        }
        catch (err) {
            throw err;
        }
    },
    getEnemy: async function(enemy) {
        try {
            let result = await pg.query({
                text: "SELECT * FROM enemies WHERE name ILIKE $1",
                values: [enemy]
            });

            return result.rows;
        }
        catch (err) {
            return null;
        }
    },
    getMission: async function(mission) {
        try {
            let result = await pg.query({
                text: "SELECT * FROM missions WHERE node ILIKE $1",
                values: [mission]
            });

            return result.rows;
        }
        catch (err) {
            return null;
        }
    },
    getRelic: async function(tier, name) {
        try {
            let result;
            let relicName = `${tier} ${name} Relic`;

            result = await pg.query({
                text: "SELECT tier, name, rating, item_name, chance, NOT EXISTS(SELECT * FROM rewards WHERE item_name ILIKE $3) AS v FROM relics WHERE tier ILIKE $1 AND name ILIKE $2",
                values: [tier, name, relicName]
            });

            return result.rows;
        }
        catch (err) {
            throw err;
        }
    },
    getAllRelics: async function() {
        try {
            let result;

            result = await pg.query({
                text: `
                    WITH available AS (
                        SELECT DISTINCT item_name
                        FROM rewards
                        WHERE item_name ILIKE '% relic'
                    )
                    SELECT tier, name, rating, item_name, chance, NOT EXISTS(SELECT * 
                        FROM available
                        WHERE relics.tier || ' ' || relics.name || ' Relic' LIKE available.item_name
                        ) AS v FROM relics;`,
                values: []
            });

            return result.rows;
        }
        catch (err) {
            throw err;
        }
    },
    getMissionTable: async function(source) {
        try {
            let missionDrops = await pg.query({
                text: "SELECT * FROM rewards WHERE source ILIKE $1 ORDER BY rotation, chance DESC, item_name ASC",
                values: [source]
            });

            return missionDrops.rows;
        }
        catch (err) {
            throw err;
        }
    },
    nuke: async function() {
        try {
            await pg.query("TRUNCATE rewards, missions, relics, enemies");
        }
        catch (err) {
            throw err;
        }
    },
    addLog: async function(ip, endpoint, term="") {
        try {
            await pg.query({
                text: "INSERT INTO requests VALUES($1, $2, $3, $4)",
                values: [ip, endpoint, term, new Date()]
            });
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = functions;