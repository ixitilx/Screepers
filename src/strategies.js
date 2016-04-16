var imp_memorySweep = require('strategy_memory_sweep')
var imp_creepLoop   = require('strategy_creep_loop')
var imp_harvesting  = require('strategy_harvesting')
var imp_manageSpawns = require('strategy_manage_spawns')

var strategies = [imp_memorySweep, imp_creepLoop, imp_manageSpawns, imp_harvesting]

exports.initialize = function()
{
    if(!Memory.strategies)
        Memory.strategies = new Object()
    
    strategies.forEach(function(strategy)
    {
        if(strategy.initialize)
            strategy.initialize()
    })
}

exports.run = function()
{
    strategies.forEach(function(strategy)
    {
        if(strategy.run)
            strategy.run()
    })
}
