"use strict";

const Store      = require("../Store");
const rmdir      = require("rmdir");
const appRootDir = require("app-root-dir");
const Q          = require("q");
const path       = require("path");

const testDir = "store-test";

describe("Store", function() {
    afterEach(function(done) {
        Q.nfcall(rmdir, path.join(appRootDir.get(), testDir))
            .then(() => done())
            .catch(done);
    });

    it("Creates a Store instance", function() {
        const store = new Store({
            name: testDir
        });
    });
});
