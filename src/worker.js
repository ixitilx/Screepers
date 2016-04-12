var imp_constants = require('constants')
var imp_table     = require('table')
var imp_tasklib   = require('tasklib')

var TASK_DONE = imp_constants.TASK_DONE

function createWorkerTable()
{
    var table = new imp_table.Table('worker_table', imp_tasklib.HarvestEnergyTask)

    // Main logic
    table.AddStateTransition(imp_tasklib.HarvestEnergyTask,     TASK_DONE,        imp_tasklib.StoreEnergyTask)
    table.AddStateTransition(imp_tasklib.StoreEnergyTask,       ERR_FULL,         imp_tasklib.BuildTask)
    table.AddStateTransition(imp_tasklib.BuildTask,             TASK_DONE,        imp_tasklib.UpgradeControllerTask)
    
    table.AddStateTransition(imp_tasklib.HarvestEnergyTask,     ERR_NOT_ENOUGH_RESOURCES,   imp_tasklib.StoreEnergyTask)
    table.AddStateTransition(imp_tasklib.StoreEnergyTask,       ERR_NOT_ENOUGH_RESOURCES,   imp_tasklib.HarvestEnergyTask)
    table.AddStateTransition(imp_tasklib.BuildTask,             ERR_NOT_ENOUGH_RESOURCES,   imp_tasklib.HarvestEnergyTask)
    table.AddStateTransition(imp_tasklib.UpgradeControllerTask, ERR_NOT_ENOUGH_RESOURCES,   imp_tasklib.HarvestEnergyTask)

    // Doing fine
    table.AddStateTransition(imp_tasklib.HarvestEnergyTask,     OK,                         imp_tasklib.HarvestEnergyTask)
    table.AddStateTransition(imp_tasklib.StoreEnergyTask,       OK,                         imp_tasklib.StoreEnergyTask)
    table.AddStateTransition(imp_tasklib.UpgradeControllerTask, OK,                         imp_tasklib.UpgradeControllerTask)
    table.AddStateTransition(imp_tasklib.BuildTask,             OK,                         imp_tasklib.BuildTask)

    // Move around
    table.addMoveTransition(imp_tasklib.HarvestEnergyTask,      imp_tasklib.MoveToSourceTask)
    table.addMoveTransition(imp_tasklib.StoreEnergyTask,        imp_tasklib.MoveToStorageTask)
    table.addMoveTransition(imp_tasklib.BuildTask,              imp_tasklib.MoveToSiteTask)
    table.addMoveTransition(imp_tasklib.UpgradeControllerTask,  imp_tasklib.MoveToControllerTask)

    // Errors
    table.AddStateTransition(imp_tasklib.MoveToSiteTask, ERR_INVALID_TARGET, imp_tasklib.HarvestEnergyTask)

    return table
}

var workerTable = createWorkerTable()

exports.spawn = function(spawn)
{
    var source = spawn.room.find(FIND_SOURCES)[0]

    var mem = new Object()
    mem.role = 'worker'

    mem.taskId = imp_tasklib.HarvestEnergyTask.id
    mem.tableId = workerTable.id
    mem.sourceId = source.id

    spawn.createCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], null, mem)
}
