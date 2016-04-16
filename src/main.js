for(name in Game.creeps)
    delete Game.creeps[name].memory.taskId

require('extension_creep')
require('extension_source')
require('extension_spawn')

require('role_harvester')
require('role_hauler')

var strategies = require('strategies')
var worker = require('role_worker')
var imp_spawn_mgr = require('role_spawn_manager')
var renew = require('renew')
var utils = require('utils')

function mainLoop()
{
    // Renew strategy
    renew.renewCreep(Game.spawns.Spawn1, renew.findOldCreep(Game.spawns.Spawn1))

    strategies.run()

    // Spawning strategy
    // if(utils.creepsByMemory({role:'worker'}).length < 4)
    //     worker.spawn(Game.spawns.Spawn1)

    if(utils.creepsByMemory({role:'spawn_manager'}).length < 1)
        imp_spawn_mgr.spawn(Game.spawns.Spawn1)
}

exports.loop = mainLoop

strategies.initialize()
