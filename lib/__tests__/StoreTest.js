"use strict";

const Store      = require("../Store");
const rmdir      = require("rmdir");
const appRootDir = require("app-root-dir");
const Q          = require("q");
const path       = require("path");
const async      = require("asyncawait/async");
const await      = require("asyncawait/await");
const expect     = require("chai").expect;
const fs         = require("fs");
const mkdirp     = require("mkdirp");

const testDir = "store-test";

const createMockData = async(function() {
    this.obj = {
        id:   "76ba67b8-7907-11e6-8b77-86f30ca893d3",
        some: "data",
        is:   "cool"
    };
    this.obj2 = {
        id:     "bc7e5fb6-7907-11e6-8b77-86f30ca893d3",
        muchas: "gracias"
    };

    await(Q.nfcall(mkdirp ,path.join(appRootDir.get(), testDir)));

    fs.writeFileSync(path.join(appRootDir.get(), testDir, `${this.obj.id}.json`), JSON.stringify(this.obj), {
        flag: "w+"
    });
    fs.writeFileSync(path.join(appRootDir.get(), testDir, `${this.obj2.id}.json`), JSON.stringify(this.obj2), {
        flag: "w+"
    });
});

describe("Store", function() {
    afterEach(function(done) {
        Q.nfcall(rmdir, path.join(appRootDir.get(), testDir))
            .then(() => done())
            .catch(done);
    });

    it("Read single entry from store", async(function() {
        await(createMockData.call(this));

        const store = new Store({
            name: testDir
        });

        await(store.ready());

        await(store.readSingle(this.obj.id)
            .then(result => expect(result).to.eql(this.obj)));
    }));

    it("Read all entries from store", async(function() {
        await(createMockData.call(this));

        const store = new Store({
            name: testDir
        });

        await(store.ready());

        await(store.readAll()
            .then(result => expect(result).to.eql([this.obj, this.obj2])));
    }));

    it("Deletes all entries from store", async(function() {
        await(createMockData.call(this));

        const store = new Store({
            name: testDir
        });

        await(store.ready());

        await(store.delete(this.obj.id));
        await(store.delete(this.obj2.id));

        await(store.readAll()
            .then(result => expect(result).to.eql([])));
    }));

    it("Stores an object into the file store, checks its presence", async(function() {
        const store = new Store({
            name: testDir
        });

        await(store.ready());

        const obj = {
            id:     "b47e5fb6-7907-11e6-8b77-86f30ca893d3",
            muchas: "buenos"
        };

        await(store.store(obj, obj.id));

        await(store.readSingle("b47e5fb6-7907-11e6-8b77-86f30ca893d3")
            .then(result => expect(result).to.eql(obj)));
    }));
});
