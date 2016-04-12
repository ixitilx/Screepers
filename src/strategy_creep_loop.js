var imp_task = require('task')
var imp_table = require('table')

function creepLoop(creep, taskArray)
{
    if(creep.memory.taskId == undefined)
        return

    // stack overflow detection
    var taskIndex = taskArray.indexOf(creep.memory.taskId)
    if(taskIndex != -1)
        return
    taskArray.push(creep.memory.taskId)

    var task = imp_task.GetTaskById(creep.memory.taskId)
    var status = task.do(creep)

    var table = imp_table.GetTableById(creep.memory.tableId)
    var newTask = table.Lookup(task, status)

    if(Memory.debug && Memory.debug == 1)
        console.log(creep.name + '.' + task.Name + '(' + status + ') => ' + (newTask?newTask.Name:'undefined'))

    if(task && newTask && task.Id != newTask.Id)
    {
        creep.memory.taskId = newTask.Id
        creep.say(newTask.Name)
        creepLoop(creep, taskArray)
    }
}

exports.run = function()
{
    for(var c in Game.creeps)
        creepLoop(Game.creeps[c], new Array())
}
