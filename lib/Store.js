"use strict";

const fs         = require("fs");
const Q          = require("q");
const path       = require("path");
const Options    = require("./Options");
const JSONStream = require("JSONStream");
const mkdirp     = require("mkdirp");

class Store {

    constructor(options) {
        Options(options);

        this.options       = Options.of(options);
        this.entries       = new Map();
        this.readyDeferred = Q.defer();

        this.__init();
    }

    readSingle(name) {
        if(!this.entries.has(name)) return Q.resolve();

        return this.__readSingle(name);
    }

    readAll() {
        return Q.all(this.entries.entries().map(key => this.__readSingle(key)));
    }

    delete(name) {
        if(!this.entries.has(name)) return Q.resolve();

        return Q.nfcall(fs.unlink, path.join(this.options.folder, this.options.name `${name}.json`))
    }

    store(object, name) {
        const deferred = Q.defer();

        const fileStream = JSONStream.stringify();

        fileStream
            .pipe(fs.createWriteStream(path.join(this.options.folder, this.options.name, `${name}.json`)))
            .on("finish", deferred.resolve)
            .on("error", deferred.reject);

        fileStream.write(object);

        return Q.when(this.__ready(), deferred.promise);
    }

    __ready() {
        return this.readyDeferred.promise;
    }

    __init() {
            this.__createDirectory()
                .then(this.__readEntries())
                .then(this.readyDeferred.resolve)
                .catch(this.readyDeferred.reject);
    }

    __createDirectory() {
        return Q.nfcall(mkdirp, path.join(this.options.folder, this.options.name));
    }

    __readEntries() {
        return Q.nfcall(fs.readdir, path.join(this.options.folder, this.options.name))
            .then(files => {
                files.filter(f => /[a-zA-Z0-9-]+.json/.test(f))
                    .forEach(f => this.entries.put(f, {}));
            });
    }

    __readSingle(name) {
        const deferred = Q.defer();

        fs.createReadStream(path.join(this.options.folder, this.options.name, `${name}.json`))
            .pipe(JSONStream.parse())
            .on("data", data => Q.when(this.readyDeferred, deferred.resolve(data)))
            .on("error", error => Q.when(this.readyDeferred, deferred.reject(error)));

        return Q.when(this.__ready(), deferred.promise);
    }

}

module.exports = Store;
