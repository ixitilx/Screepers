'use strict';

RoomPosition.prototype.serialize = function()
{
    return `${this.x} ${this.y} ${this.roomName}`
}

RoomPosition.prototype.deserialize = function(obj)
{
    if(obj instanceof RoomPosition)
        return obj

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

    throw new TypeError(`Cannot deserialise RoomPosition from ${obj}`)
}

RoomPosition.prototype.lookAround = function(lookFor, range=1)
{
    const room = Game.rooms[this.roomName]
    if(room)
        return room.lookForAtArea(lookFor, this.y-range, this.x-range, this.y+range, this.x+range, true)
    return []
}

RoomPosition.prototype.build = function(structureType)
{
    const objects = this.look()
    const myStructure = _.filter(objects, {type: structure, structure: {structureType: structureType, my:true}})
    // TODO
}
