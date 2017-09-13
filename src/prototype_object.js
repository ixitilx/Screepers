'use strict';

Object.prototype.getDefault = function(path, defaultValue= ()=>new Object())
{
    if(!_.has(this, path))
    {
        const value = typeof(defaultValue=='function') ? defaultValue() : defaultValue
        _.set(this, path, value)
        return value
    }
    return _.get(this, path)
}

Object.prototype.getConstructorName = function()
{
	return this.constructor.name
}
