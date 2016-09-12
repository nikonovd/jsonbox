"use strict";

const T       = require("tcomb");
const assign  = require("lodash.assign");
const rootDir = require("app-root-dir");

const Options = T.refinement(T.Object, function(obj) {
    return (
        T.String.is(obj.name) &&
        T.maybe(T.String).is(obj.folder)
    );
}, "Options");

Options.of = function(obj) {
    return Options(assign({}, {
        folder: rootDir.get()
    }, obj));
}

module.exports = Options;
