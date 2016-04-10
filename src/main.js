var worker = require('worker')
var renew =  require('renew')

function getHarvesters()
{
    return _.filter(Game.creeps, function(c){ return c.memory.role=='harvester';})
}

exports.getHarvesters = getHarvesters;
exports.loop = function () 
{
    var storage = Game.spawns.Spawn1
    for(var creepName in Game.creeps)
    {
        creep = Game.creeps[creepName]
        if(creep.memory)
        {
            worker.onTick(creep)
        }
    }
    
    renew.renewCreep(storage, renew.findOldCreep(storage))

    if(_(Game.creeps).size() < 10)
        worker.spawnWorker(Game.spawns.Spawn1)

    if(getHarvesters().length < 1)
        worker.spawnHarvester(Game.spawns.Spawn1)
}

