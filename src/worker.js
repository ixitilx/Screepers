var constants   = require('constants')
var tableModule = require('table')
var tasklib     = require('tasklib')


function createWorkerTable()
{
    var table = new tableModule.Table(tasklib.HarvestEnergyTask)

    // Main logic
    table.AddStateTransition(tasklib.HarvestEnergyTask,     constants.TASK_DONE,        tasklib.StoreEnergyTask)
    table.AddStateTransition(tasklib.StoreEnergyTask,       ERR_FULL,                   tasklib.BuildTask)
    table.AddStateTransition(tasklib.BuildTask,             constants.TASK_DONE,        tasklib.UpgradeControllerTask)
    
    //table.AddStateTransition(tasklib.HarvestEnergyTask,     ERR_NOT_ENOUGH_RESOURCES,   tasklib.MoveToSourceTask)
    table.AddStateTransition(tasklib.StoreEnergyTask,       ERR_NOT_ENOUGH_RESOURCES,   tasklib.HarvestEnergyTask)
    table.AddStateTransition(tasklib.BuildTask,             ERR_NOT_ENOUGH_RESOURCES,   tasklib.HarvestEnergyTask)
    table.AddStateTransition(tasklib.UpgradeControllerTask, ERR_NOT_ENOUGH_RESOURCES,   tasklib.HarvestEnergyTask)

    // Doing fine
    table.AddStateTransition(tasklib.HarvestEnergyTask,     OK,                         tasklib.HarvestEnergyTask)
    table.AddStateTransition(tasklib.StoreEnergyTask,       OK,                         tasklib.StoreEnergyTask)
    table.AddStateTransition(tasklib.UpgradeControllerTask, OK,                         tasklib.UpgradeControllerTask)
    table.AddStateTransition(tasklib.BuildTask,             OK,                         tasklib.BuildTask)

    // Move around
    table.addMoveTransition(tasklib.HarvestEnergyTask,      tasklib.MoveToSourceTask)
    table.addMoveTransition(tasklib.StoreEnergyTask,        tasklib.MoveToStorageTask)
    table.addMoveTransition(tasklib.BuildTask,              tasklib.MoveToSiteTask)
    table.addMoveTransition(tasklib.UpgradeControllerTask,  tasklib.MoveToControllerTask)

    // Errors
    table.AddStateTransition(tasklib.MoveToSiteTask, ERR_INVALID_TARGET, tasklib.HarvestEnergyTask)

    return table
}

var workerTable = createWorkerTable()

exports.spawn = function(spawn)
{
    var source = spawn.room.find(FIND_SOURCES_ACTIVE)[0]

    var mem = new Object()
    mem.role = 'worker'

    mem.taskId = tasklib.HarvestEnergyTask.Id
    mem.tableId = workerTable.Id
    mem.sourceId = source.id

    spawn.createCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], null, mem)
}
