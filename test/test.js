const chai = require('chai');
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised);

let assert = chai.assert;

const Database = require('../src/Database.js');

describe("Database", () => {
    describe("Get relics", () => {
        it("valid relic retrieved", async function () {
            let relic = await Database.getRelic("Axi", "A1");
            assert.exists(relic);
        });

        it("invalid relic rejected", async function () {
            assert.isRejected(Database.getRelic("Foo", "A1"));
        });
    });
});