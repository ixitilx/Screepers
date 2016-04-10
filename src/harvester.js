var constants   = require('constants')
var tableModule = require('table')
var tasklib     = require('tasklib')

function createHarvesterTable()
{
    var table = new tableModule.Table(tasklib.HarvestEnergyTask)

    // Main logic
    table.AddStateTransition(tasklib.HarvestEnergyTask,     constants.TASK_DONE,        tasklib.StoreEnergyTask)
    table.AddStateTransition(tasklib.StoreEnergyTask,       ERR_FULL,                   tasklib.BuildTask)
    table.AddStateTransition(tasklib.StoreEnergyTask,       ERR_NOT_ENOUGH_RESOURCES,   tasklib.HarvestEnergyTask)

    // Doing fine
    table.AddStateTransition(tasklib.HarvestEnergyTask,     OK,                         tasklib.HarvestEnergyTask)
    table.AddStateTransition(tasklib.StoreEnergyTask,       OK,                         tasklib.StoreEnergyTask)

    // Move around
    table.addMoveTransition(tasklib.HarvestEnergyTask,  tasklib.MoveToSourceTask)
    table.addMoveTransition(tasklib.StoreEnergyTask,    tasklib.MoveToStorageTask)

    return table
}

var harvesterTable = createHarvesterTable()

exports.spawn = function(spawn)
{
    var mem = new Object()
    mem.role = 'harvester'

    var source = spawn.room.find(FIND_SOURCES_ACTIVE)[0]

    mem.storageId = '570a80e8d21b022c2c7e8ada'
    mem.taskId = HarvestEnergyTask.Id
    mem.tableId = harvesterTable.Id
    mem.sourceId = source.id

    spawn.createCreep([WORK, CARRY, MOVE, MOVE], null, mem)
}
