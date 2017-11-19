const Database = require("./Database.js");

const functions = {
    getRelic: async function(tier, name) {
        try {
            let relic = await functions.getRawRelic(tier, name);
            let newRelic = {
                relic_name: relic.relic_name,
                vaulted: relic.vaulted
            }
            newRelic.drops = {
                common: [],
                uncommon: [],
                rare: []
            }

            // Seems a bit messy
            newRelic.drops.common.push(relic.Intact[0]);
            newRelic.drops.common.push(relic.Intact[1]);
            newRelic.drops.common.push(relic.Intact[2]);
            newRelic.drops.uncommon.push(relic.Intact[3]);
            newRelic.drops.uncommon.push(relic.Intact[4]);
            newRelic.drops.rare.push(relic.Intact[5]);

            /*
            let sources = await Database.findItem(relic.relic_name, true);

            newRelic.sources = sources.rewards;
            console.log(newRelic);
            */

            return newRelic;
        }
        catch (err) {
            throw err;
        }
    },
    getRawRelic: async function(tier, name) {
        try {
            let rows = await Database.getRelic(tier, name);

            if(!rows || !rows.length) {
                throw new Error("No relic found");
            }

            let data = {};
            data.relic_name = `${tier} ${name} Relic`;
            data.vaulted = false;

            for(item of rows) {
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

            data.Intact.sort((a, b) => { return b.chance - a.chance });
            data.Exceptional.sort((a, b) => { return b.chance - a.chance });
            data.Flawless.sort((a, b) => { return b.chance - a.chance });
            data.Radiant.sort((a, b) => { return b.chance - a.chance });

            return data;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = functions;