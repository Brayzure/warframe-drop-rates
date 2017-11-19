const Database = require("./Database.js");

const functions = {
    getEnemy: async function(name) {
        try {
            let rows = await Database.getEnemy(name);
            if(!rows || !rows.length) {
                throw new Error("No enemy found");
            }

            return rows[0];
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = functions;