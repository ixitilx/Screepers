function cleanupDeadCreepMemory(cache)
{
    var creepByName = Object
    cache.creeps.forEach(function(creep){creepByName[creep.name] = creep})

    for(var creepName in Memory.creeps)
    {
        if(!creepByName[creepName])
        {
            console.log('Cleaning creep [' + creepName + '] memory')
            delete Memory.creeps[creepName]
        }
    }
}

function cleanupSpawnsMemory(cache)
{
    var spawnByName = Object()
    cache.spawns.forEach(function(spawn){spawnByName[spawn.name] = spawn})

    for(var spawnName in Memory.spawns)
    {
        if(!spawnByName[spawnName])
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
