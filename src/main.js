var harvester = require('role.harvester');

module.exports.loop = function () 
{
    var storage = Game.spawns.Spawn1
    var room = storage.room
    var source = room.find(FIND_SOURCES_ACTIVE)[0]
    for(var creep in Game.creeps)
    {
        if(creep.memory && creep.memory.role == 'harvester')
        {
            harvester.move(creep, source, storage);
        }
    }
}
