const Relic = require("./core/Relic.js");
const Mission = require("./core/Mission.js");
const Enemy = require("./core/Enemy.js");

const Database = require("./core/Database.js");

const functions = {
    getRelic: async function(tier, name, verbose=false) {
        try {
            let relic = await Relic.getRelic(tier, name, verbose);
            let missions = await Database.findItem(`${tier} ${name} Relic`, true);
            relic.sources = missions.rewards;
            return relic;
        }
        catch (err) {
            throw err;
        }
    },
    getAllRelics: async function(tier, name, verbose=false) {
        try {
            let relics = await Relic.getAllRelics(verbose);
            let relicMissions = await Database.getAllRelicMissions();
            
            let relicSources = {};

            for(row of relicMissions) {
                if(!relicSources[row.item_name]) {
                    relicSources[row.item_name] = [];
                }

                relicSources[row.item_name].push(row);
            }

            for(i in relics) {
                let relic = relics[i];
                let relicName = `${relic.tier} ${relic.name} Relic`;
                if(relicSources[relicName]) {
                    relics[i].sources = relicSources[relicName];
                }
                else {
                    relics[i].sources = [];
                }
            }
            return relics;
        }
        catch (err) {
            throw err;
        }
    },
    getMission: async function(node) {
        try {
            let mission = await Mission.getMission(node);
            return mission;
        }
        catch (err) {
            throw err;
        }
    },
    getMissionTable: async function(node) {
        try {
            return await Mission.getMissionTable(node);
        }
        catch (err) {
            throw err;
        }
    },
    getEnemy: async function(name) {
        try {
            let enemy = await Enemy.getEnemy(name);
            return enemy;
        }
        catch (err) {
            throw err;
        }
    },
    findItem: async function(item, exact=false) {
        try {
            let databaseResults = await Database.findItem(item, exact);

            let data = {};
            let name, prop, d;
            for(entry of databaseResults.rewards) {
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
                        let enemy = await Enemy.getEnemy(entry.source);
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
                    case "stage":
                        let mission;
                        try {
                            mission = await Mission.getMission(entry.source);
                        }
                        catch(err) {
                            mission = null;
                        }
                        let d;
                        if(mission) {
                            d = {
                                node: mission.node,
                                sector: mission.sector,
                                mission_type: mission.mission_type,
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
                        
                        if(entry.type == "rotation" || entry.type == "stage") {
                            d.rotation = entry.rotation;
                        }
                        if(entry.type == "stage") {
                            d.stage = entry.stage;
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

            for(relic of databaseResults.relics) {
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
    }
}

module.exports = functions;