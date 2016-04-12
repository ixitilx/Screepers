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

Creep.prototype.loginfo = function()
{
    var role = this.memory.role
    var taskId = this.memory.taskId
    var taskName = imp_task.GetTaskById(taskId).name
    var tableId = this.memory.tableId
    var tableName = imp_table.GetTableById(tableId).name

    console.log('Role [' + role + '], Table [' + tableName + '](' + tableId + '), Task [' + taskName + '](' + taskId + ')');
}

exports.creepsByMemory = creepsByMemory