"use strict";

const assign  = require("lodash.assign");
const Options = require("./Options.type");
const await   = require("asyncawait/await");
const T       = require("tcomb");
const UUID    = require("uuid");
const Q       = require("q");
const Store   = require("./Store");

class JSONBox {

    static of(options) {
        return new JSONBox(options);
    }

    constructor(options) {
        Options(options);

        this.options = assign({}, options);
        this.entries = new Map();
        this.db      = new Store(this.options);
    }

    all(cb) {
        const promise = this.db.ready().then(() => this.db.readAll());

        return T.Nil.is(cb) ? promise : promise
            .then(result => cb.call(null, null, result))
            .fail(error => cb.call(null, error));
    }

    get(id, cb) {
        const promise = this.db.ready().then(() => this.db.readSingle(id));

        return T.Nil.is(cb) ? promise : promise
            .then(result => cb.call(null, null, result))
            .fail(error => cb.call(null, error));
    }

    store(object, cb) {
        if(T.Nil.is(object)) return cb.call(null, new Error(`${object} is not allowed to be stored.`));

        const clonable = this.__clone(object);
        const storable = T.Nil.is(clonable.id) ? assign(clonable, {
            id: UUID.v4()
        }) : clonable;

        const promise = this.db.ready().then(() => this.db.store(storable, storable.id));

        return T.Nil.is(cb) ? promise : promise
            .then(() => cb.call(null, null, storable))
            .fail(error => cb.call(null, error));
    }

    delete(id, cb) {
        const promise = this.db.ready().then(() => this.db.delete(id));

        return T.Nil.is(cb) ? promise : promise
            .then(() => cb.call(null))
            .fail(error => cb.call(null, error));
    }

    __clone(object) {
        return assign({}, object);
    }

}

module.exports = JSONBox;
