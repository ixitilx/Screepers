var imp = 
{
    constants: require('constants')
    table    : require('table')
    tasklib  : require('tasklib')
}

var TASK_DONE = imp.constants.TASK_DONE

function createWorkerTable()
{
    var table = new imp.table.Table(imp.tasklib.HarvestEnergyTask)

    // Main logic
    table.AddStateTransition(imp.tasklib.HarvestEnergyTask,     TASK_DONE,        imp.tasklib.StoreEnergyTask)
    table.AddStateTransition(imp.tasklib.StoreEnergyTask,       ERR_FULL,         imp.tasklib.BuildTask)
    table.AddStateTransition(imp.tasklib.BuildTask,             TASK_DONE,        imp.tasklib.UpgradeControllerTask)
    
    table.AddStateTransition(imp.tasklib.HarvestEnergyTask,     ERR_NOT_ENOUGH_RESOURCES,   imp.tasklib.StoreEnergyTask)
    table.AddStateTransition(imp.tasklib.StoreEnergyTask,       ERR_NOT_ENOUGH_RESOURCES,   imp.tasklib.HarvestEnergyTask)
    table.AddStateTransition(imp.tasklib.BuildTask,             ERR_NOT_ENOUGH_RESOURCES,   imp.tasklib.HarvestEnergyTask)
    table.AddStateTransition(imp.tasklib.UpgradeControllerTask, ERR_NOT_ENOUGH_RESOURCES,   imp.tasklib.HarvestEnergyTask)

    // Doing fine
    table.AddStateTransition(imp.tasklib.HarvestEnergyTask,     OK,                         imp.tasklib.HarvestEnergyTask)
    table.AddStateTransition(imp.tasklib.StoreEnergyTask,       OK,                         imp.tasklib.StoreEnergyTask)
    table.AddStateTransition(imp.tasklib.UpgradeControllerTask, OK,                         imp.tasklib.UpgradeControllerTask)
    table.AddStateTransition(imp.tasklib.BuildTask,             OK,                         imp.tasklib.BuildTask)

    // Move around
    table.addMoveTransition(imp.tasklib.HarvestEnergyTask,      imp.tasklib.MoveToSourceTask)
    table.addMoveTransition(imp.tasklib.StoreEnergyTask,        imp.tasklib.MoveToStorageTask)
    table.addMoveTransition(imp.tasklib.BuildTask,              imp.tasklib.MoveToSiteTask)
    table.addMoveTransition(imp.tasklib.UpgradeControllerTask,  imp.tasklib.MoveToControllerTask)

    // Errors
    table.AddStateTransition(imp.tasklib.MoveToSiteTask, ERR_INVALID_TARGET, imp.tasklib.HarvestEnergyTask)

    return table
}

var workerTable = createWorkerTable()

exports.spawn = function(spawn)
{
    var source = spawn.room.find(FIND_SOURCES)[0]

    var mem = new Object()
    mem.role = 'worker'

    mem.taskId = imp.tasklib.HarvestEnergyTask.Id
    mem.tableId = workerTable.Id
    mem.sourceId = source.id

    spawn.createCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], null, mem)
}
