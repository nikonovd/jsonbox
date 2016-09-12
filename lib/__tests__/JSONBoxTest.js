const JSONBox = require("../JSONBox");
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

describe("JSONBox", function() {
    afterEach(function(done) {
        Q.nfcall(rmdir, path.join(appRootDir.get(), testDir))
            .then(() => done())
            .catch(done);
    });

    it("Get all entries (callback style)", function(done) {
        createMockData.call(this)
            .then(() => {
                const box = JSONBox.of({
                    name: testDir
                });
                const expected = [this.obj, this.obj2];

                box.all(function(error, data) {
                    if(error) done(error);

                    expect(data).to.eql(expected);
                    done();
                });
            });
    });

    it("Get all entries (promise style)", function(done) {
        createMockData.call(this)
            .then(() => {
                const box = JSONBox.of({
                    name: testDir
                });

                return Q.nfcall(box.all.bind(box));
            })
            .then(data => {
                expect(data).to.eql([this.obj, this.obj2]);
                done();
            })
            .catch(done);
    });
});
