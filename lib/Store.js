"use strict";

const fs         = require("fs");
const Q          = require("q");
const path       = require("path");
const Options    = require("./Options.type");
const JSONStream = require("JSONStream");
const mkdirp     = require("mkdirp");
const get        = require("lodash.get");

class Store {

    constructor(options) {
        Options(options);

        this.options       = Options.of(options);
        this.entries       = new Map();
        this.readyDeferred = Q.defer();

        this.__init();
    }

    readSingle(name) {
        if(!this.ready().isFulfilled()) return this.__reject();
        if(!this.entries.has(name))     return Q.resolve();

        return this.__readSingle(name);
    }

    readAll() {
        if(!this.ready().isFulfilled()) return this.__reject();

        const results = [];

        this.entries.forEach((value, key) => results.push(this.__readSingle(key)));

        return Q.all(results);
    }

    delete(name) {
        if(!this.ready().isFulfilled()) return this.__reject();
        if(!this.entries.has(name))     return Q.resolve();

        return Q.nfcall(fs.unlink, path.join(this.options.folder, this.options.name, `${name}.json`))
            .then(() => this.entries.delete(name));
    }

    store(object, name) {
        if(!this.ready().isFulfilled()) return this.__reject();

        const deferred   = Q.defer();
        const fileStream = JSONStream.stringify(false);

        fileStream
            .pipe(fs.createWriteStream(path.join(this.options.folder, this.options.name, `${name}.json`)))
            .on("finish", () => {
                this.entries.set(object.id, {});
                deferred.resolve();
            })
            .on("error", deferred.reject);

        fileStream.write(object);
        fileStream.end();

        return deferred.promise;
    }

    ready() {
        return this.readyDeferred.promise;
    }

    __init() {
            this.__createDirectory()
                .then(this.__readEntries())
                .then(this.readyDeferred.resolve)
                .fail(this.readyDeferred.reject);
    }

    __createDirectory() {
        return Q.nfcall(mkdirp, path.join(this.options.folder, this.options.name));
    }

    __readEntries() {
        return Q.nfcall(fs.readdir, path.join(this.options.folder, this.options.name))
            .then(files => files.filter(this.__isJSONFile).map(this.__removeFileExtension).forEach(f => this.entries.set(f, {})));
    }

    __removeFileExtension(fileName) {
        return get(fileName.split(".json"), 0);
    }

    __isJSONFile(fileName) {
        return /[a-zA-Z0-9-]+.json/.test(fileName);
    }

    __readSingle(name) {
        const deferred = Q.defer();

        fs.createReadStream(path.join(this.options.folder, this.options.name, `${name}.json`))
            .pipe(JSONStream.parse())
            .on("data", data => deferred.resolve(data))
            .on("error", error => deferred.reject(error));

        return deferred.promise;
    }

    __reject() {
        return Q.reject(new Error("Store is not ready yet."));
    }

}

module.exports = Store;
