'use strict';

exports.queueCreep = function(body, memory, pos=null)
{
    const canSpawn = _.filter(Game.spawns, spawn => spawn.canSpawn)
    if(_.size(canSpawn)==0)
        return ERR_NOT_FOUND

    if(pos)
    {
        let spawn = _(canSpawn).filter({room:{name:pos.roomName}}).first()
        if(spawn)
            return spawn.queueCreep(body, memory)

        const posDistance = (spawn) => Game.map.getRoomLinearDistance(spawn.room.name, pos.roomName)
        spawn = _(canSpawn).sortBy(spawn => posDistance).first()
        if(spawn)
            return spawn.queueCreep(body, memory)
    }

    return _.first(canSpawn).queueCreep(body, memory)
}
