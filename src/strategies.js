var imp_memorySweep = require('strategy_memory_sweep')
var imp_creepLoop   = require('strategy_creep_loop')
var imp_harvesting  = require('strategy_harvesting')

var strategies = [imp_memorySweep, imp_creepLoop, imp_harvesting]

exports.initialize = function()
{
    if(Memory.strategies == undefined)
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
        if(stragegy.run)
            strategy.run()
    })
}
