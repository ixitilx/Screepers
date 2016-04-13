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

    console.log(creep.memory.role)
    var task = imp_task.getTaskById(creep.memory.taskId)
    var status = task.do(creep)

    var table = imp_table.getTable(creep.memory.role)
    var newTask = table.Lookup(task, status)

    if(Memory.debug && Memory.debug == 1)
        console.log(creep.name + '.' + task.name + '(' + status + ') => ' + (newTask?newTask.name:'undefined'))

    if(task && newTask && task.id != newTask.id)
    {
        creep.memory.taskId = newTask.id
        creep.say(newTask.name)
        creepLoop(creep, taskArray)
    }
}

exports.run = function()
{
    for(var c in Game.creeps)
        creepLoop(Game.creeps[c], new Array())
}
