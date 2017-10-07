'use strict';

const assert = require('assert')

RoomPosition.prototype.serialize = function()
{
    return `${this.x} ${this.y} ${this.roomName}`
}

RoomPosition.prototype.serializeShort = function()
{
    return `${this.x} ${this.y}`
}

Object.defineProperty(RoomPosition, 'deserialize', {value:deserialize})

function deserialize(obj)
{
    if(typeof(obj)==='string')
    {
        const regex = /^(\d+) (\d+) ([EW]\d+[SN]\d+)$/i
        const ret = regex.exec(obj)
        if(ret)
            return new RoomPosition(ret[1], ret[2], ret[3])
    }

    if (typeof(obj)==='object' &&
        _.isNumber(obj.x) &&
        _.isNumber(obj.y) &&
        _.isString(obj.roomName) )
    {
        return new RoomPosition(obj.x, obj.y, obj.roomName)
    }

    if (typeof(obj)==='object' && 'pos' in obj)
    {
        return RoomPosition.deserialize(obj.pos)
    }

    throw new TypeError(`Cannot deserialise RoomPosition from ${obj}`)
}

RoomPosition.prototype.lookAround = function(lookFor, range=1)
{
    const room = Game.rooms[this.roomName]
    if(room)
    {
        const ret = room.lookForAtArea(lookFor, this.y-range, this.x-range, this.y+range, this.x+range, true)
        function wrap(rec)
        {
            const data = rec[lookFor]
            if(typeof(data)==='object')
            {
                if(!_.has(data, 'pos'))
                    data.pos = new RoomPosition(rec.x, rec.y, room.name)
                return data
            }
            else if(typeof(data)==='string')
            {
                const wrappedData = {pos: new RoomPosition(rec.x, rec.y, room.name)}
                wrappedData[lookFor] = data
                return wrappedData
            }
            throw new Error(`Unknown Room.lookForAtArea record type: ${JSON.stringify(rec)}`)
        }

        assert.True(_.every(ret, rec => _.has(rec, lookFor)))
        return _.map(ret, wrap)
    }
    return []
}

RoomPosition.prototype.build = function(structureType)
{
    const objects = this.look()
    const myStructure = _.filter(objects, {type: structure, structure: {structureType: structureType, my:true}})
    // TODO
}
