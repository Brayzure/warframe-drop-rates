const chai = require('chai');
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised);

let assert = chai.assert;

describe("Database interface", function() {
    const Database = require("../src/core/Database.js");

    before(async function() {
        await Database.removeReward("Foo Prime");
        await Database.removeEnemy("Hunter Prime");
        await Database.removeMission("Hadron");

        await Database.addReward({
            source: "Hadron",
            reward_type: "rotation",
            rotation: "B",
            chance: 0.25,
            item: "Foo Prime"
        });
        await Database.addReward({
            source: "Hunter Prime",
            reward_type: "enemy_blueprint",
            rotation: "",
            chance: 0.25,
            item: "Foo Prime"
        });
        await Database.addEnemy({
            name: "Hunter Prime",
            mod_drop_chance: 0.03,
            blueprint_drop_chance: 0.06
        });
        await Database.addMission({
            node: "Hadron",
            sector: "Andromeda",
            mission_type: "Defense",
            event: false
        });
    });

    after(async function() {
        await Database.removeReward("Foo Prime");
        await Database.removeEnemy("Hunter Prime");
        await Database.removeMission("Hadron");
    });

    describe("Generic usage", function() {
        const Interface = require("../src/Interface.js");
        it("should retrieve incomplete item name", async function() {
            let items = await Interface.findItem("Foo");
            assert.isAtLeast(items.length, 1);
        });

        it("should retrieve exact item name", async function() {
            let items = await Interface.findItem("Foo Prime");
            assert.isAtLeast(items.length, 1);
        });

        it("should fail to retrieve invalid item name", async function() {
            let items = await Interface.findItem("Foo Prime Plus");
            assert.equal(items.length, 0);
        });
    });

    describe("Relics", function() {
        const Relic = require("../src/core/Relic.js");
        it("should retrieve valid relic", async function() {
            let relic = await Relic.getRelic("Axi", "A1");
            assert.exists(relic);
        });

        it("should not find invalid relic", async function() {
            assert.isRejected(Relic.getRelic("Foo", "A1"));
        });

        it("should obtain very many relics (more than 50)", async function() {
            let relics = await Relic.getAllRelics();
            assert.isAbove(relics.length, 50);
        });
    });

    describe("Missions", function() {
        const Mission = require("../src/core/Mission.js");
        it("should retrieve valid mission", async function() {
            let mission = await Mission.getMission("Hadron");
            assert.exists(mission);
        });
        it("should not retrieve invalid mission", async function() {
            assert.isRejected(Mission.getMission("Foo"));
        });
        it("should retrieve valid mission table", async function() {
            let missionTable = await Mission.getMissionTable("Hadron");
            assert.exists(missionTable);
        });
        it("should not retrieve invalid mission table", async function() {
            assert.isRejected(Mission.getMissionTable("Foo"));
        });
    });

    describe("Enemies", function() {
        const Enemy = require("../src/core/Enemy.js");
        it("should retrieve valid enemy", async function () {
            let enemy = await Enemy.getEnemy("Hunter Prime");
            assert.exists(enemy);
            assert.equal(enemy.blueprints.length, 1, "correct number of blueprint drops retrieved");
            assert.equal(enemy.mods.length, 0, "correct number of mod drops retrieved");
        });

        it("should not retrieve invalid enemy", async function() {
            assert.isRejected(Enemy.getEnemy("Foo"));
        });
    });
});