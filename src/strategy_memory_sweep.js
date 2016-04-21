function cleanupDeadCreepMemory(cache)
{
    var creepByName = Object

    cache.creeps.forEach(function(creep)
    {
        creepByName[creep.name] = creep
    })

    for(var creepName in Memory.creeps)
    {
        if(!creepByName[creepName])
        {
            console.log('Cleaning [' + creepName + '] memory')
            delete Memory.creeps[creepName]
        }
    }

    return OK
}


exports.cleanupDeadCreepMemory = cleanupDeadCreepMemory
