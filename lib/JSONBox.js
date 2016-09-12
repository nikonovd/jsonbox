"use strict";

const assign  = require("lodash.assign");
const T       = require("tcomb");
const UUID    = require("uuid");
const Q       = require("q");
const Store   = require("./Store");

class JSONBox {

    static of(options) {
        return new JSONBox(options);
    }

    constructor(options) {
        this.db = new Store(options);
    }

    all(cb) {
        const promise = this.db.ready().then(() => this.db.readAll());

        return !T.Function.is(cb) ? promise : promise
            .then(result => cb.call(null, null, result))
            .fail(error => cb.call(null, error));
    }

    get(id, cb) {
        const promise = this.db.ready().then(() => this.db.readSingle(id));

        return !T.Function.is(cb) ? promise : promise
            .then(result => cb.call(null, null, result))
            .fail(error => cb.call(null, error));
    }

    store(object, cb) {
        if(T.Nil.is(object)) return this.__rejectNullable(object, cb);

        const cloneable = this.__clone(object);
        const storeable = T.Nil.is(cloneable.id) ? assign(cloneable, {
            id: UUID.v4()
        }) : cloneable;

        const promise = this.db.ready().then(() => this.db.store(storeable, storeable.id));

        return !T.Function.is(cb) ? promise.then(() => storeable) : promise
            .then(() => cb.call(null, null, storeable))
            .fail(error => cb.call(null, error));
    }

    delete(id, cb) {
        const promise = this.db.ready().then(() => this.db.delete(id));

        return !T.Function.is(cb) ? promise : promise
            .then(() => cb.call(null))
            .fail(error => cb.call(null, error));
    }

    __clone(object) {
        return assign({}, object);
    }

    __rejectNullable(nullable, cb) {
        const error = new Error(`${nullable} is not allowed to be stored.`);

        return T.Function.is(cb) ? cb.call(null, error) : Q.reject(error);
    }

}

module.exports = JSONBox;
