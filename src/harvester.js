var constants   = require('constants')
var tableModule = require('table')
var tasklib     = require('tasklib')

function warnAboutSpawns(room)
{
    var spawnCount = creep.room.find(FIND_MY_STRUCTURES, {filter: function(s) { s.structureType == STRUCTURE_SPAWN }}).length
    if(spawnCount > 1)
        console.log('MORE THAN ONE SPAWNS FOUND! Check if they contribute towards room energy capacity')
}

function buildBody(work, carry, move)
{
    var body = new Array()
    for(var idx = 0; idx < work; ++idx)     body.push(WORK)
    for(var idx = 0; idx < carry; ++idx)    body.push(CARRY)
    for(var idx = 0; idx < move; ++idx)     body.push(MOVE)
    return body
}

function getBestHarvesterBody(room)
{
    warnAboutSpawns(room)
    var maxEnergy = room.energyCapacityAvailable
    var carry = 1
    var move = 1
    var work = Math.min(5, (maxEnergy - 50*(carry+move))/100)
    return buildBody(work, carry, move)
}

function createHarvesterTable()
{
    var table = new tableModule.Table(tasklib.HarvestEnergyTask)

    // Main logic
    table.AddStateTransition(tasklib.HarvestEnergyTask,     OK,                         tasklib.StoreEnergyTask)
    table.AddStateTransition(tasklib.HarvestEnergyTask,     constants.TASK_DONE,        tasklib.MoveToStorageTask)
    table.AddStateTransition(tasklib.HarvestEnergyTask,     ERR_NOT_IN_RANGE,           tasklib.MoveToSourceTask)
    table.AddStateTransition(tasklib.StoreEnergyTask,       ERR_NOT_IN_RANGE,           tasklib.HarvestEnergyTask)
    table.AddStateTransition(tasklib.StoreEnergyTask,       ERR_NOT_ENOUGH_RESOURCES,   tasklib.HarvestEnergyTask)
    table.AddStateTransition(tasklib.MoveToStorageTask,     constants.TASK_DONE,        tasklib.StoreEnergyTask)
    table.AddStateTransition(tasklib.MoveToSourceTask,      constants.TASK_DONE,        tasklib.HarvestEnergyTask)

    return table
}

var harvesterTable = createHarvesterTable()

exports.spawn = function(spawn)
{
    var mem = new Object()
    mem.role = 'harvester'

    var source = spawn.room.find(FIND_SOURCES)[0]

    mem.taskId = tasklib.HarvestEnergyTask.Id
    mem.tableId = harvesterTable.Id
    mem.sourceId = source.id

    spawn.createCreep(getBestHarvesterBody(spawn.room), null, mem)
}
