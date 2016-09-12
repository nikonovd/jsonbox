"use strict";

const expect     = require("chai").expect;
const Options    = require("../Options");
const sinon      = require("sinon");
const appRootDir = require("app-root-dir");

describe("Options", function() {
    before(function() {
        this.appRootDir = sinon.stub(appRootDir, "get").returns("/home/test");
    });
    after(function() {
        this.appRootDir.restore();
    });

    it("Creates an Options instance", function() {
        const opts = {
            name:   "hello",
            folder: "/home"
        };

        expect(Options.of(opts)).to.eql(opts);
    });

    it("Creates an Options instance with default folder", function() {
        const opts = {
            name:   "hello",
        };

        expect(Options.of(opts)).to.eql({
            name:   "hello",
            folder: "/home/test"
        });
    });

    it("Creates a malformed Options instance, should throw TypeError", function() {
        const opts = {};

        expect(() => Options.of(opts)).to.throw(TypeError);
    });
});
