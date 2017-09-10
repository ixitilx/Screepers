'use strict';

const Screeps = require('screeps')



exports.queueCreep = function(body, memory, roomName=null)
{
    const spawns = _(Game.spawns).filter(spawn => spawn.canSpawn)
                                 .sortBy(spawn => spawn.room.energyCapacityAvailable)
                                 .reverse()
                                 .value()

    const roomDistance = (spawn) => Game.map.getRoomLinearDistance(spawn.room.name, roomName)
    const bestSpawn = roomName ? _(spawns).sortBy(roomDistance).first() : _(spawns).first()
    if(bestSpawn)
        return bestSpawn.queueCreep(body, memory)
    return ERR_NOT_FOUND
}

let tickCache = {}
exports.getObjectById = function(id)
{
    if(tickCache._ts != Game.time)
        tickCache = {_ts:Game.time}

    if(!_.has(tickCache, id))
        tickCache[id] = Game.getObjectById(id)

    return tickCache[id]
}
