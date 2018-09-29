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
    if (!criteria) {
        if (_.isFunction(message))
            message = message();
        throw new Error(message);
    }
};

function createArray(filler, dimensions, coords) {
    const subCoords = coords ? coords.concat([0]) : [0];

    if (dimensions.length == 1) {
        return Array.from({length: dimensions[0]}, (v, i) => {
            subCoords[subCoords.length-1] = i;
            return filler(subCoords);
        });
    } else {
        return Array.from({length: dimensions[0]}, (v, i) => {
            subCoords[subCoords.length-1] = i;
            return createArray(
                filler,
                dimensions.slice(1, dimensions.length),
                subCoords);
        });
    }
};

module.exports = {
    defineProperty: defineProperty,
    assert: assert,
    createArray: createArray,
};
