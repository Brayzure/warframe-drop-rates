const postgres = require('pg');

const auth = require('../auth/auth.json');

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
    /*
    * TODO: Change return value to array of Drop resources
    */
    findItem: async function(item, exact=false) {
        try {
            if(item.length < 1) {
                return [];
            }

            let result;
            result = await pg.query({
                text: `SELECT * FROM rewards WHERE item_name ILIKE ${exact?"$1":"'%' || $1 || '%'"} ORDER BY item_name, chance DESC`,
                values: [item]
            });

            let data = {};
            let name, prop, d;
            for(entry of result.rows) {
                name = entry.item_name;
                if(!data[name]) {
                    data[name] = {
                        item_name: name,
                        sortie: {
                            chance: 0
                        },
                        enemies: [],
                        missions: [],
                        relics: []
                    };
                }
                prop = "";
                switch(entry.type) {
                    case "enemy_mod":
                        prop = 'mod_drop_chance';
                    case "enemy_blueprint":
                        if(!prop) {
                            prop = 'blueprint_drop_chance'
                        }
                        let enemy = await functions.findEnemy(entry.source);
                        let enemyItem = {
                            source: enemy.name,
                            item_name: name,
                            item_type: prop == "mod_drop_chance" ? "mod" : "blueprint",
                            item_chance: entry.chance,
                            chance: entry.chance * enemy[prop]
                        }
                        enemyItem[prop] = enemy[prop];
                        data[name].enemies.push(enemyItem);
                        break;
                    case "single":
                    case "rotation":
                        let mission = await functions.findMission(entry.source);
                        let d;
                        if(mission) {
                            d = {
                                node: mission.node,
                                sector: mission.sector,
                                mission_type: mission.mission_type,
                                rotation: !!(entry.type == "rotation"),
                                event_exclusive: mission.event,
                                item_name: name,
                                chance: entry.chance
                            }
                        }
                        else {
                            d = {
                                node: entry.source,
                                item_name: name,
                                chance: entry.chance
                            }
                        }
                        
                        if(entry.type == "rotation") {
                            d.rotation = entry.rotation;
                        }
                        data[name].missions.push(d);
                        break;
                    case "sortie":
                        data[name].sortie.chance = entry.chance;
                        break;
                    default:
                        throw new Error(`Unrecognized reward entry type: ${entry.type}`);
                        break;
                }
            }

            if(exact) {
                result = await pg.query({
                    text: "SELECT tier, name, rating, item_name, chance, NOT EXISTS(SELECT * FROM rewards WHERE item_name = relics.tier || ' ' || relics.name || ' Relic') AS vaulted FROM relics WHERE item_name ILIKE $1 ORDER BY vaulted, item_name, tier, name, chance DESC",
                    values: [item]
                });
            }
            else {
                result = await pg.query({
                    text: "SELECT tier, name, rating, item_name, chance, NOT EXISTS(SELECT * FROM rewards WHERE item_name = relics.tier || ' ' || relics.name || ' Relic') AS vaulted FROM relics WHERE item_name ILIKE '%' || $1 || '%' ORDER BY vaulted, item_name, tier, name, chance DESC",
                    values: [item]
                });
            }

            for(relic of result.rows) {
                if(!data[relic.item_name]) {
                    data[relic.item_name] = {
                        item_name: relic.item_name,
                        sortie: {
                            chance: 0
                        },
                        enemies: [],
                        missions: [],
                        relics: []
                    }
                }

                data[relic.item_name].relics.push(relic);
            }

            let finalData = [];

            for(drop in data) {
                if(data.hasOwnProperty(drop)) {
                    let dropData = data[drop];
                    finalData.push(dropData);
                }
            }

            // TODO: Sort by overall chance
            return finalData;
        }
        catch (err) {
            throw err;
        }
    },
    findEnemy: async function(enemy) {
        try {
            let result = await pg.query({
                text: "SELECT * FROM enemies WHERE name = $1",
                values: [enemy]
            });

            if(!result.rows.length) {
                return null;
            }
            else {
                return result.rows[0];
            }
        }
        catch (err) {
            return null;
        }
    },
    findMission: async function(mission) {
        try {
            let result = await pg.query({
                text: "SELECT * FROM missions WHERE node = $1",
                values: [mission]
            });

            if(!result.rows.length) {
                return null;
            }
            else {
                return result.rows[0];
            }
        }
        catch (err) {
            return null;
        }
    },
    getRelic: async function(tier, name) {
        try {
            let result;
            tier = capitalize(tier);
            name = capitalize(name);
            let relicName = `${tier} ${name} Relic`;
            result = await pg.query({
                text: "SELECT tier, name, rating, item_name, chance, NOT EXISTS(SELECT * FROM rewards WHERE item_name = $3) AS v FROM relics WHERE tier = $1 AND name = $2",
                values: [tier, name, relicName]
            });
            if(!result.rows.length) {
                throw new Error("Relic doesn't exist.");
            }
            let data = {};
            data.vaulted = false;
            for(item of result.rows) {
                if(!data[item.rating]) {
                    data[item.rating] = [];
                }
                if(item.v) {
                    data.vaulted = true;
                }
                let r = {
                    item_name: item.item_name,
                    chance: item.chance
                }
                data[item.rating].push(r);
            }

            data.Intact.sort((a, b) => { return b.chance - a.chance});
            data.Exceptional.sort((a, b) => { return b.chance - a.chance});
            data.Flawless.sort((a, b) => { return b.chance - a.chance});
            data.Radiant.sort((a, b) => { return b.chance - a.chance});

            let sources = await pg.query({
                text: "SELECT * FROM rewards LEFT OUTER JOIN missions ON (rewards.source = missions.node) WHERE item_name = $1",
                values: [relicName]
            });

            data.sources = [];

            for(m of sources.rows) {
                let mission = {};
                if(m.node) {
                    let s = `(${m.mission_type}`;
                    if(m.rotation) {
                        s += ` Rotation ${m.rotation}`;
                    }
                    s += `) ${m.sector}/${m.node}`;
                    mission = {
                        source: s,
                        node: m.node,
                        planet: m.sector,
                        mission_type: m.mission_type,
                        rotation: m.rotation ? m.rotation : "",
                        item_name: relicName,
                        chance: m.chance,
                        event_exclusive: m.event
                    }
                }
                else {
                    mission = {
                        source: m.source,
                        rotation: m.rotation ? m.rotation : "",
                        item_name: relicName,
                        chance: m.chance
                    }
                }
                data.sources.push(mission);
            }

            return data;
        }
        catch (err) {
            throw err;
        }
    },
    getMissionTable: async function(source) {
        try {
            let sourceWords = source.split(" ");
            for(i in sourceWords) {
                sourceWords[i] = capitalize(sourceWords[i]);
            }
            source = sourceWords.join(" ");
            let missionData = await functions.findMission(source);
            let missionDrops = await pg.query({
                text: "SELECT * FROM rewards WHERE source = $1 ORDER BY rotation, chance DESC, item_name ASC",
                values: [source]
            });

            if(!missionDrops.rows.length) {
                return false;
            }

            let mission = {};
            if(missionData) {
                mission = missionData;
            }
            if(missionDrops.rows[0].rotation) {
                mission.reward_scheme = "rotation";
            }
            else {
                mission.reward_scheme = "single";
            }
            mission.drops = [];
            for(drop of missionDrops.rows) {
                mission.node = drop.source;
                mission.drops.push(drop);
            }

            return mission;
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

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

module.exports = functions;