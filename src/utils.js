var imp_task = require('task')
var imp_table = require('table')

function creepsByMemory(memory)
{
    return _.filter(Game.creeps, function(creep)
    {
        for(prop in memory)
        {
            if(memory[prop] != creep.memory[prop])
                return false
        }
        return true
    });
}

exports.creepsByMemory = creepsByMemory
