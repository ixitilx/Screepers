'use strict';

function defineProperty(className, name, impl, enumerable=false, configurable=true) {
    const descriptor = {
        get: impl,
        enumerable: enumerable,
        configurable: configurable,
    };

    Object.defineProperty(className.prototype, name, descriptor);
};

function assert(criteria, message='Assertion error') {
    if(!criteria) {
        throw new Error(message);
    }
};

module.exports = {
    defineProperty: defineProperty,
    assert: assert,
};
