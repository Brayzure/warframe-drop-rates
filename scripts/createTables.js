const postgres = require('pg');

const auth = require('../auth/auth.json');

var pg = new postgres.Client({
    user: auth.pg_user,
    password: auth.pg_password,
    database: auth.pg_db
});

pg.connect(async (err) => {
    if(err) {
        console.log(err);
        process.exit();
    }

    try {
        await pg.query(relics);
        await pg.query(rewards);
        await pg.query(enemies);
        await pg.query(missions);
        await pg.query(requests);
        console.log("Tables created.");
    }
    catch (err) {
        console.log(err);
        console.log("An error occured when attempting to create the tables. Do they already exist?");
    }

    process.exit();
});

const relics = `CREATE TABLE relics (
tier text,
name text,
rating text,
item_name text,
chance real
);`;

const rewards = `CREATE TABLE rewards (
source text,
type text,
rotation text,
chance real,
item_name text
);`

const enemies = `CREATE TABLE enemies (
name text PRIMARY KEY,
mod_drop_chance real,
blueprint_drop_chance real
);`

const missions = `CREATE TABLE missions (
node text PRIMARY KEY,
sector text,
mission_type text,
event bool
);`

const requests = `CREATE TABLE requests (
ip text,
endpoint text,
term text,
time timestamp
);`