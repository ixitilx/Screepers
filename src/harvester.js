var imp_constants = require('constants')
var imp_table     = require('table')
var imp_tasklib   = require('tasklib')

var TASK_DONE = imp_constants.TASK_DONE

function getWorkRequired(source)
{
    return Math.ceil(source.energyCapacity/600)
}

function warnAboutSpawns(room)
{
    var spawnCount = room.find(FIND_MY_STRUCTURES, {filter: function(s) { s.structureType == STRUCTURE_SPAWN }}).length
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

function getBody(spawn, source)
{
    var room = spawn.room
    warnAboutSpawns(room)
    var maxEnergy = room.energyCapacityAvailable
    var carry = 1
    var move = 1
    var work = Math.min(getWorkRequired(source), (maxEnergy - 50*(carry+move))/100)
    return buildBody(work, carry, move)
}

function createHarvesterTable()
{
    var table = new imp_table.Table(imp_tasklib.HarvestEnergyTask)

    // Main logic
    table.AddStateTransition(imp_tasklib.HarvestEnergyTask,     OK,                         imp_tasklib.StoreEnergyTask)
    table.AddStateTransition(imp_tasklib.HarvestEnergyTask,     TASK_DONE,                  imp_tasklib.MoveToStorageTask)
    table.AddStateTransition(imp_tasklib.HarvestEnergyTask,     ERR_NOT_IN_RANGE,           imp_tasklib.MoveToSourceTask)
    table.AddStateTransition(imp_tasklib.StoreEnergyTask,       ERR_NOT_IN_RANGE,           imp_tasklib.HarvestEnergyTask)
    table.AddStateTransition(imp_tasklib.StoreEnergyTask,       ERR_NOT_ENOUGH_RESOURCES,   imp_tasklib.HarvestEnergyTask)
    table.AddStateTransition(imp_tasklib.MoveToStorageTask,     TASK_DONE,                  imp_tasklib.StoreEnergyTask)
    table.AddStateTransition(imp_tasklib.MoveToSourceTask,      TASK_DONE,                  imp_tasklib.HarvestEnergyTask)

    return table
}

var harvesterTable = createHarvesterTable()

exports.spawn = function(spawn, source)
{
    var mem = new Object()
    mem.role = 'harvester'

    mem.taskId = imp_tasklib.HarvestEnergyTask.Id
    mem.tableId = harvesterTable.Id
    mem.sourceId = source.id

    return spawn.createCreep(getBody(spawn, source), null, mem)
}

exports.getBody = getBody
exports.getWorkRequired = getWorkRequired
