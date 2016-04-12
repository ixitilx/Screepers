exports.run = function()
{
    for(creepName in Memory.creeps)
    {
        var found = false
        for(var spawn in Game.spawns)
        {
            var spawning = Game.spawns[spawn].spawning
            if(spawning)
                found = found || spawning.name == creepName
        }

        if(!found && Game.creeps[creepName] == undefined)
        {
            console.log('Cleaning [' + creepName + ']\'s memory')
            delete Memory.creeps[creepName]
        }
    }
}
