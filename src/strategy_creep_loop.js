var imp_task = require('task')
var imp_table = require('table')

function logTasks(creep, taskArray)
{
    if(!Memory.debug)
        return

    var formatter = function(task)
    {
        if(task.id < 0)
            return task.name
        // return task.name + '[' + task.id + ']=(' + task.status + ')'
        return task.name + '=(' + task.status + ')'
    }
    
    console.log(creep.name, creep.memory.role, taskArray.map(formatter).join(' => '))
}

function isLogged(taskArray, taskId)
{
    for(var idx=0; idx<taskArray.length; ++idx)
        if(taskArray[idx].id==taskId)
            return true
    return false
}

function getCreepTask(creep, table)
{
    if(!creep.memory.taskId)
        return table.defaultTask

    var task = imp_task.getTaskById(creep.memory.taskId)
    return task ? task : table.defaultTask
}

function creepLoop(creep, taskArray)
{
    var table = imp_table.getTable(creep.memory.role)
    var task  = creep.memory.taskId ? imp_task.getTaskById(creep.memory.taskId) : table.defaultTask

    // stack overflow detection
    if(isLogged(taskArray, task.id))
    {
        taskArray.push({id:-2, name:'cycle', status:null})
        logTasks(creep, taskArray)
        return
    }

    //console.log(creep.name, task.name)

    var status = task.do(creep)
    taskArray.push({id:creep.memory.taskId, name:task.name, status:status})

    var newTask = table.lookup(task, status)
    if(newTask)
    {
        creep.memory.taskId = newTask.id
        creep.say(newTask.name)
        creepLoop(creep, taskArray)
    }
    else
    {
        taskArray.push({id:-1, name:'undefined', status:null})
        logTasks(creep, taskArray)
    }
}

exports.run = function()
{
    for(var c in Game.creeps)
        creepLoop(Game.creeps[c], new Array())
}
