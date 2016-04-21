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

function cleanupSpawnsMemory()
{
    if(!Memory.spawns)
        return

    for(var spawnName in Memory.spawns)
    {
        if(!Game.spawns[spawnName])
        {
            console.log('Cleaning spawn [' + spawnName + '] memory')
            delete Memory.spawns[spawnName]
        }
    }
}

function cleanupSourcesMemory()
{
    
}

exports.cleanupDeadCreepMemory = cleanupDeadCreepMemory
exports.cleanupSpawnsMemory = cleanupSpawnsMemory
