"use strict";

const T       = require("tcomb");
const assign  = require("lodash.assign");
const rootDir = require("app-root-dir");

const Options = T.interface({
    name:   T.String,
    folder: T.maybe(T.String)
}, "Options");

Options.of = function(obj) {
    return Options(assign({}, {
        folder: rootDir.get()
    }, obj));
}

module.exports = Options;
