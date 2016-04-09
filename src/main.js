var harvester = require('role.harvester');

module.exports.loop = function () 
{
    var storage = Game.spawns.Spawn1
    var room = storage.room
    var source = room.find(FIND_SOURCES_ACTIVE)
    for(var creep in Game.creeps)
    {
        harvester.move(creep, source, storage);
    }
}
