for(name in Game.creeps)
    delete Game.creeps[name].memory.taskId

require('extension_creep')
require('extension_source')
require('extension_spawn')
require('extension_resource')
require('extension_controller')

require('role_harvester')
require('role_hauler')
require('role_upgrader')
require('role_worker')
require('role_spawn_manager')

require('utils')

var strategies = require('strategies')


function mainLoop()
{
    // rst, move renew logic to a strategy script and trigger from strategies.js
    if(typeof(Memory.paused) != typeof(undefined) && !Memory.paused)
    {
        strategies.run()
    }
    else
    {
        if((Game.tick % 100) == 0)
            console.log('Script is paused. Type [Memory.paused = false] to resume.')
    }
}

exports.loop = mainLoop
