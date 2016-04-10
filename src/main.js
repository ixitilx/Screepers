var worker = require('worker')
var renew =  require('renew')

function creepsByRole(role)
{
    return _.filter(Game.creeps, function(c)
    {
        return c.memory.role == role;
    });
}

function getProgress(site)
{
    return 100 * site.progress / site.progressTotal;
}

function onTick() 
{
    var storage = Game.spawns.Spawn1
    for(var creepName in Game.creeps)
    {
        var creep = Game.creeps[creepName]
        if(creep.memory)
        {
            worker.onTick(creep)
        }
    }

    // Building strategy
    if(Game.time % 100 == 0)
    {
        var sites = Game.spawns.Spawn1.room.find(FIND_MY_CONSTRUCTION_SITES)
        if(sites && sites.length > 0)
        {
            sites.sort( function(a, b) {
                return getProgress(a) - getProgress(b)
            });

            creepsByRole.forEach(
                function(c) { c.memory.siteId = sites[0].id }
            );
        }
    }
    
    // renew.renewCreep(storage, renew.findOldCreep(storage))

    if(creepsByRole('worker').length < 10)
        worker.spawnWorker(Game.spawns.Spawn1)

    // if(creepsByRole('harvester').length < 1)
    //     worker.spawnHarvester(Game.spawns.Spawn1)
}

exports.loop = onTick;
exports.creepsByRole = creepsByRole;
