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
const sinon      = require("sinon");
const uuid       = require("uuid");
const assign     = require("lodash.assign");

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
    before(function() {
        this.uuid = sinon.stub(uuid, "v4").returns("53ccfe14-7916-11e6-8b77-86f30ca893d3");
    });
    after(function() {
        this.uuid.restore();
    })
    afterEach(function(done) {
        Q.nfcall(rmdir, path.join(appRootDir.get(), testDir))
            .then(() => done())
            .catch(() => done());
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

                return box.all();
            })
            .then(data => {
                expect(data).to.eql([this.obj, this.obj2]);
                done();
            })
            .catch(done);
    });

    it("Get a single entry (callback style)", function(done) {
        createMockData.call(this)
            .then(() => {
                const box = JSONBox.of({
                    name: testDir
                });
                box.get(this.obj.id, function(error, data) {
                    if(error) done(error);

                    expect(data).to.eql(this.obj);
                    done();
                }.bind(this));
            });
    });

    it("Get a single entry (promise style)", function(done) {
        createMockData.call(this)
            .then(() => {
                const box = JSONBox.of({
                    name: testDir
                });

                return box.get(this.obj.id);
            })
            .then(data => {
                expect(data).to.eql(this.obj);
                done();
            })
            .catch(done);
    });

    it("Store an entry (callback style)", function(done) {
        const box = JSONBox.of({
            name: testDir
        });
        const storable = {
            abc: 123,
            def: "456"
        };

        box.store(storable, function(error, data) {
            if(error) done(error);

            expect(data).to.eql(assign({}, data, {
                id: "53ccfe14-7916-11e6-8b77-86f30ca893d3"
            }));
            done();
        }.bind(this));
    });

    it("Store an entry (promise style)", function(done) {
        const box = JSONBox.of({
            name: testDir
        });
        const storable = {
            abc: 123,
            def: "456"
        };

        box.store(storable)
            .then(data => {
                expect(data).to.eql(assign({}, data, {
                    id: "53ccfe14-7916-11e6-8b77-86f30ca893d3"
                }));
                done();
            })
            .catch(done);
    });

    it("Store an null entry (callback style), expect Error", function(done) {
        const box = JSONBox.of({
            name: testDir
        });

        box.store(null, function(error, data) {
            if(error) done();
            else done(new Error("Expected to throw an Error!"));
        });
    });

    it("Store an null entry (promise style), expect Error", function(done) {
        const box = JSONBox.of({
            name: testDir
        });

        box.store(null)
            .then(data => done(new Error("Expected to throw an Error!")))
            .catch(() => done());
    });


    it("Deletes an entry (callback style)", function(done) {
        createMockData.call(this)
            .then(() => {
                const box = JSONBox.of({
                    name: testDir
                });
                box.delete(this.obj, function(error) {
                    if(error) done(error);

                    done();
                }.bind(this));
            });
    });

    it("Deletes an entry (promise style)", function(done) {
        createMockData.call(this)
            .then(() => {
                const box = JSONBox.of({
                    name: testDir
                });
                box.delete(this.obj.id)
                    .then(() => done())
                    .catch(done);
            });
    });
});
