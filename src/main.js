for(name in Game.creeps)
    delete Game.creeps[name].memory.taskId

require('extension_creep')
require('extension_source')
require('extension_spawn')

require('role_harvester')
require('role_hauler')

var strategies = require('strategies')
var worker = require('role_worker')
var renew = require('renew')
var utils = require('utils')

function mainLoop()
{
    // Renew strategy
	// renew.renewCreep(Game.spawns.Spawn1, renew.findOldCreep(Game.spawns.Spawn1))

    strategies.run()
}

exports.loop = mainLoop
