var worker = require('worker')
var renew =  require('renew')


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
            if(creep.memory.role == 'worker') worker.onTick(creep)
        }
    }
    
    renew.renewCreep(storage, renew.findOldCreep(storage))

    if(_(Game.creeps).size() < 10)
        worker.spawnWorker(Game.spawns.Spawn1)

    if(_.filter(Game.creeps, {role: 'harvester'}).size() < 1)
        worker.spawnHarvester(Game.spawns.Spawn1)
}

