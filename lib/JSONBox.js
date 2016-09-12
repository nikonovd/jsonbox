"use strict";

const assign = require("lodash.assign");
const fs     = require("fs");
const Q      = require("q");
const path   = require("path");
const Options = require("./Options");

class JSONBox {

    static of(options) {
        return new JSONBox(options);
    }

    constructor(options) {
        Options(options);
        this.options = assign({}, options);
        this.entries = new Map();
    }

    all(cb) {

    }

    get(id, cb) {

    }

    save(object, cb) {

    }

    delete(id, cb) {

    }

}

module.exports = JSONBox;
