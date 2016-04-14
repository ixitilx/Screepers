require('extension_creep')
require('extension_source')

var strategies = require('strategies')
var worker = require('role_worker')
var renew = require('renew')
var utils = require('utils')

function mainLoop()
{
    // Renew strategy
    renew.renewCreep(Game.spawns.Spawn1, renew.findOldCreep(Game.spawns.Spawn1))

    strategies.run()

    // Spawning strategy
    if(utils.creepsByMemory({role:'worker'}).length < 4)
        worker.spawn(Game.spawns.Spawn1)
}

exports.loop = mainLoop

strategies.initialize()
