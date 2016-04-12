var imp = {
    memorySweep: require('strategy/memorySweep')
    creepLoop  : require('strategy/creepLoop'),
    harvesting : require('strategy/harvesting'),
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
