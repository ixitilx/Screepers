var worker = require('worker');
var renew = require('renew'); 


module.exports.loop = function () 
{
    var storage = Game.spawns.Spawn1
    var room = storage.room
    var source = room.find(FIND_SOURCES_ACTIVE)[0]
    for(var creepName in Game.creeps)
    {
        creep = Game.creeps[creepName]
        if(creep.memory)
        {
            if(creep.memory.role == 'worker') worker.onTick(creep);
        }
    }
    renew(storage, findOldCreep(storage));

    if(_(Game.creeps).size() < 10)
        worker.spawnWorker(Game.spawns.Spawn1);
}
