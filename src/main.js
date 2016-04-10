var harvester = require('role.harvester');
var worker = require('worker')

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
            if(creep.memory.role == 'harvester') harvester.move(creep, source, storage);
            if(creep.memory.role == 'worker') worker.onTick(creep);
        }
    }

    if(_(Game.creeps).size() < 10)
        Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE], null, {role: 'harvester'});

    if(_(Game.creeps).filter({role: 'worker'}).size() < 1)
        worker.SpawnWorker(Game.spawns.Spawn1);
}
