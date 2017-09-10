'use strict';

const logger = require('logger')

function makeMemoryPropertyDescriptor(name, computeFunc)
{
    return {
        get: function()
        {
            if(!_.has(this.memory, name))
                _.set(this.memory[name] = computeFunc.call(this))
            return this.memory[name]
        },

        set: function(value)
        {
            this.memory[name] = value
        }
    }
}

function makeCachedPropertyDescriptor(propertyName, computeFunc)
{
    const cache = new Object()

    return {
        get: function()
        {
            if(!_.has(cache, propertyName))
                cache[propertyName] = computeFunc.call(this)
            return cache[propertyName]
        },

        set: function(value)
        {
            cache[propertyName] = value
            return value
        }
    }
}

function makeTickPropertyDescriptor(propertyName, computeFunc)
{
    let cache = new Object()
    let time = Game.time

    function getTickCache()
    {
        if(time != Game.time)
            cache = new Object()
        return cache
    }

    return {
        get: function()
        {
            const cache = getTickCache()
            if(!_.has(cache, propertyName))
                cache[propertyName] = computeFunc.call(this)
            return cache[propertyName]
        },

        set: function(value)
        {
            const cache = getTickCache()
            cache[propertyName] = value
            return value
        }
    }
}

function makeGetMemory(memoryName)
{
    return function()
    {
        if(Memory[memoryName][this.id] === undefined)
            Memory[memoryName][this.id] = {_created:Game.time}
        return Memory[memoryName][this.id]
    }
}

exports.newTickProperty = function(classObj, computeFunc, propertyName)
{
    Object.defineProperty(classObj.prototype, propertyName, makeTickPropertyDescriptor(propertyName, computeFunc))
}

exports.newCachedProperty = function(classObj, computeFunc, propertyName)
{
    Object.defineProperty(classObj.prototype, propertyName, makeCachedPropertyDescriptor(propertyName, computeFunc))
}

exports.newMemoryProperty = function(classObj, computeFunc, propertyName, memoryName)
{
    if(!('memory' in classObj.prototype))
    {
        if(Memory[memoryName] === undefined)
            Memory[memoryName] = {}
        Object.defineProperty(classObj.prototype, 'memory', {get: makeGetMemory(memoryName)})
    }

    Object.defineProperty(classObj.prototype, propertyName, makeMemoryPropertyDescriptor(propertyName, computeFunc))
}

exports.buildCreepBodyArray = function(bodyPartPairs)
{
    if(!_.every(bodyPartPairs, ([type, count]) => BODYPARTS_ALL.includes(type) && count>0))
        throw new Error('Screeps.buildCreepBodyArray, invalid input:' + JSON.stringify(bodyPartPairs))

    const bodyArray = []
    const addPair = ([type, count]) => _.times(count, ()=>bodyArray.push(type))
    _.each(bodyPartPairs, addPair)
    // logger.trace('Screeps.buildCreepBodyArray', JSON.stringify(bodyPartPairs), '=>', JSON.stringify(bodyArray))
    return bodyArray
}

exports.getBodyCost = function(body)
{
    assert(typeof(body)==='object')

    function partCost(type)
    {
        assert(type in BODYPART_COST)
        return BODYPART_COST[type]
    }

    return _(body).map((count, type) => count*BODYPART_COST[type]).sum()
}

function assert(test)
{
    if(!test)
        throw new Error('Assertion failed!')
}

exports.assert = assert

function resolveRoomPosition(obj)
{
    if(obj instanceof RoomPosition)
        return obj
    
    if(_.has(obj, 'pos'))
    {
        return obj.pos instanceof RoomPosition ? obj.pos : resolveRoomPosition(obj.pos)
    }

    if(_.has(obj, 'x') && _.has(obj, 'y') && _.has(obj, 'roomName'))
        return new RoomPosition(obj.x, obj.y, obj.roomName)

    throw new Error('Cannot resolve RoomPosition of ' + JSON.stringify(obj))
}

exports.resolveRoomPosition = resolveRoomPosition

function samePos(a, b)
{
    a = resolveRoomPosition(a)
    b = resolveRoomPosition(b)
    return _.eq(a, b)
}

exports.samePos = samePos
