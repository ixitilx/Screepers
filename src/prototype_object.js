'use strict';

const proto = Object.prototype

function Object_getDefault(path, defaultValue= ()=>new Object())
{
    if(!_.has(this, path))
    {
        const value = typeof(defaultValue=='function') ? defaultValue() : defaultValue
        _.set(this, path, value)
        return value
    }
    return _.get(this, path)
}

Object.defineProperty(proto, 'getDefault', {
    value: Object_getDefault,
    enumerable: false,
    configurable: true
})
