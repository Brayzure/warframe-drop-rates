const Database = require("./Database.js");

const functions = {
    getRelic: async function(tier, name, verbose=false) {
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

            if(verbose) {
                newRelic.intact = relic.Intact;
                newRelic.exceptional = relic.Exceptional;
                newRelic.flawless = relic.Flawless;
                newRelic.radiant = relic.Radiant;
            }

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
            data.relic_name = capitalize(`${tier} ${name} Relic`);
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

            data = sortRelicDrops(data);

            return data;
        }
        catch (err) {
            throw err;
        }
    }
}

function sortRelicDrops(relic) {
    for(i=1; i<relic.Intact.length; i++) {
        let pos = i;
        for(j=i-1; j>=0 && relic.Intact[pos].chance > relic.Intact[j].chance; j--) {
            relic.Intact.swap(pos, j);
            relic.Exceptional.swap(pos, j);
            relic.Flawless.swap(pos, j);
            relic.Radiant.swap(pos, j);
            pos--;
        }
    }

    return relic;
}

Array.prototype.swap = function(i, j) {
    let temp = this[i];
    this[i] = this[j];
    this[j] = temp;
};

function capitalize(phrase) {
    let words = [];
    for(word of phrase.split(" ")) {
        let newWord = word.charAt(0).toUpperCase() + word.slice(1);
        words.push(newWord);
    }
    return words.join(" ");
}

module.exports = functions;