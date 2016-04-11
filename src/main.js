var worker = require('worker')
var harvester = require('harvester')
var renew = require('renew')
var taskModule = require('task')
var tableModule = require('table')


function creepsByMemory(memory)
{
    return _.filter(Game.creeps, function(creep)
    {
        for(prop in memory)
        {
            prop = creep.memory[prop]
            if(prop == undefined || prop != memory[prop])
                return false
        }
        return true
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
    if(creepsByMemory({role:'worker'}).length < 4)
        worker.spawn(Game.spawns.Spawn1)


    // Harvester spawning strategy
    var getClosestSpawn = function(room)        { return Game.spawns.Spawn1 }  // or best spawn by other criteria
    var getWork         = function(bodyPart)    { return bodyPart.type == WORK ? 1 : 0 }
    var getCreepWork    = function(creep)       { return _.sum(creep.body.map(getWork)) }
    var getTotalWork    = function(creepArray)  { return _.sum(creepArray.map(getCreepWork)) }
    var getHarvestRooms = function()            { return [Game.spawns.Spawn1.room] }

    var harvestRooms = getHarvestRooms()
    for(var i=0; i<harvestRooms.length; ++i)
    {
        var room = harvestRooms[i]
        var spawn = getClosestSpawn(room)

        var sources = room.find(FIND_SOURCES)
        for(var j=0; j<sources.length; ++j)
        {
            var source = sources[j]

            var sourceHarvesters = creepsByMemory({role:'harvester', sourceId:source.id})
            var totalWork = getTotalWork(sourceHarvesters)
            var needWork = harvester.getWorkRequired(source)

            if(totalWork < needWork)
                harvester.spawn(spawn, source)
        }
    }
}

exports.loop = mainLoop;
exports.creepsByMemory = creepsByMemory;
