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
    },
    getAllRelics: async function(verbose=false) {
        try {
            let rows = await Database.getAllRelics();
            let relics = processRelics(rows, verbose);

            return relics;
        }
        catch(err) {
            throw err;
        }
    }
}

function sortRelicDrops(relic) {
    for(let i=1; i<relic.Intact.length; i++) {
        let pos = i;
        for(let j=i-1; j>=0 && relic.Intact[pos].chance > relic.Intact[j].chance; j--) {
            relic.Intact.swap(pos, j);
            relic.Exceptional.swap(pos, j);
            relic.Flawless.swap(pos, j);
            relic.Radiant.swap(pos, j);
            pos--;
        }
    }

    return relic;
}

function processRelics(rows, verbose) {
    let data = {};

    for(let item of rows) {
        let relicName = `${item.tier} ${item.name} Relic`;

        if(!data[relicName]) {
            data[relicName] = {};
            data[relicName].relic_name = relicName;
            data[relicName].vaulted = false;
        }

        if(!data[relicName][item.rating]) {
            data[relicName][item.rating] = [];
        }
        if(item.v) {
            data[relicName].vaulted = true;
        }
        let r = {
            item_name: item.item_name,
            chance: item.chance
        }
        data[relicName][item.rating].push(r);
    }

    let ret = [];

    for(let relic in data) {
        if(data.hasOwnProperty(relic)) {
            let r = sortRelicDrops(data[relic]);

            let newRelic = {
                relic_name: r.relic_name,
                vaulted: r.vaulted
            }
            newRelic.drops = {
                common: [],
                uncommon: [],
                rare: []
            }

            // Seems a bit messy
            newRelic.drops.common.push(r.Intact[0]);
            newRelic.drops.common.push(r.Intact[1]);
            newRelic.drops.common.push(r.Intact[2]);
            newRelic.drops.uncommon.push(r.Intact[3]);
            newRelic.drops.uncommon.push(r.Intact[4]);
            newRelic.drops.rare.push(r.Intact[5]);

            if(verbose) {
                newRelic.intact = r.Intact;
                newRelic.exceptional = r.Exceptional;
                newRelic.flawless = r.Flawless;
                newRelic.radiant = r.Radiant;
            }

            ret.push(newRelic);
        }
    }

    return ret;
}

Object.defineProperty(Array.prototype, "swap", {
    enumerable: false,
    value: function(i, j) {
        let temp = this[i];
        this[i] = this[j];
        this[j] = temp;

        return this;
    }
});

function capitalize(phrase) {
    let words = [];
    for(word of phrase.split(" ")) {
        let newWord = word.charAt(0).toUpperCase() + word.slice(1);
        words.push(newWord);
    }
    return words.join(" ");
}

module.exports = functions;