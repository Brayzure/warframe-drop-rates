const postgres = require('pg');

const auth = require('../auth/auth.json');

var pg = new postgres.Client({
    user: auth.pg_user,
    password: auth.pg_password,
    database: auth.pg_db
});

pg.connect(async (err) => {
    if(err) {
        throw err;
    }

    try {
        await pg.query("DROP TABLE relics");
        await pg.query("DROP TABLE rewards");
        await pg.query("DROP TABLE enemies");
        await pg.query("DROP TABLE missions");
        await pg.query("DROP TABLE requests");
        console.log("Tables successfully deleted.");
    }
    catch (err) {
        console.log(err);
        console.log("An error occured, do the tables exist?");
    }
    
    process.exit();
});