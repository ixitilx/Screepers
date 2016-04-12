var memorySweep = require('strategy_memory_sweep')
var creepLoop   = require('strategy_creep_loop')
var harvesting  = require('strategy_harvesting')

var imp = 
{
    memorySweep: memorySweep,
    creepLoop  : creepLoop,
    harvesting : harvesting
}

for(strat in imp)
    exports[strat] = imp[strat]

exports.initialize = function()
{
    if(Memory.strategies == undefined)
        Memory.strategies = new Object()
    
    for(strategy in strategies)
    {
        var init = strategies[strategy].initialize
        if(init)
            init()
    }
}

exports.run = function()
{
    for(strategy in strategies)
        strategies[strategy].run()
}
