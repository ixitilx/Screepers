var worker = require('worker')
var harvester = require('harvester')
var renew = require('renew')
var taskModule = require('task')
var tableModule = require('table')


function creepsByRole(role)
{
    return _.filter(Game.creeps, function(c)
    {
        return c.memory.role == role;
    });
}

function getProgress(site)
{
    return 1000000 * site.progress / site.progressTotal;
}

function creepLoop(creep, taskArray)
{
    if(creep.memory.taskId == undefined)
        return

    // stack overflow detection
    var taskIndex = taskArray.indexOf(creep.memory.taskId)
    if(taskIndex != -1)
        return
    taskArray.push(creep.memory.taskId)

    var task = taskModule.GetTaskById(creep.memory.taskId)
    var status = task.do(creep)

    var table = tableModule.GetTableById(creep.memory.tableId)
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

function mainLoop()
{
    // Memory cleanup strategy
    for(c in Memory.creeps)
    {
        if(Game.creeps[c] == undefined)
        {
            console.log('Cleaning [' + c + ']\'s memory')
            delete Memory.creeps[c]
        }
    }

    // Creep control strategy
    for(var creepName in Game.creeps)
        creepLoop(Game.creeps[creepName], new Array())

    // Renew strategy
    //var storage = Game.spawns.Spawn1
    // renew.renewCreep(storage, renew.findOldCreep(storage))

    
    // Spawning strategy
    if(creepsByRole('worker').length < 4)
        worker.spawn(Game.spawns.Spawn1)

    // if(creepsByRole('harvester').length < 1)
    //     harvester.spawn(Game.spawns.Spawn1)
}

exports.loop = mainLoop;
exports.creepsByRole = creepsByRole;
