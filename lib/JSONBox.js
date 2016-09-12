"use strict";

const assign  = require("lodash.assign");
const Options = require("./Options");
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
        this.store   = new Store(this.options);
    }

    all(cb) {
        const promise = this.store.ready().then(() => this.store.readAll());

        return T.Nil.is(cb) ? promise : promise
            .then(result => cb.call(null, undefined, result))
            .catch(error => cb.call(error));
    }

    get(id, cb) {
        const promise = this.store.ready().then(() => this.store.readSingle(id));

        return T.Nil.is(cb) ? promise : promise
            .then(result => cb.call(null, undefined,result))
            .catch(error => cb.call(error));
    }

    save(object, cb) {
        const clonable = this.__clone(object);
        const storable = T.Nil.is(clonable.id) ? assign(clonable, {
            id: UUID.v4()
        }) : clonable;

        const promise = Q.when(this.store.ready(), this.store.store(storable));

        return T.Nil.is(cb) ? promise : promise
            .then(result => cb.call(null, undefined,result))
            .catch(error => cb.call(error));
    }

    delete(id, cb) {
        const promise = Q.when(this.store.ready(), this.store.delete(id));

        return T.Nil.is(cb) ? promise : promise
            .then(() => cb.call(null))
            .catch(error => cb(error));
    }

    __clone(object) {
        return assign({}, object);
    }

}

module.exports = JSONBox;
