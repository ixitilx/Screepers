var constants = require('constants')

var taskModule = require('task')
var tableModule = require('table')

var tasklib = require('tasklib')

var Table = tableModule.Table

function onTick(creep)
{
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
    }
}

function WorkerTable()
{
    var table = new Table(tasklib.HarvestEnergyTask)

    // Main logic
    table.AddStateTransition(tasklib.HarvestEnergyTask,     constants.TASK_DONE,        tasklib.StoreEnergyTask)
    table.AddStateTransition(tasklib.StoreEnergyTask,       ERR_FULL,                   tasklib.BuildTask)
    table.AddStateTransition(tasklib.BuildTask,             constants.TASK_DONE,        tasklib.UpgradeControllerTask)
    
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

function HarvesterTable()
{
    var table = new Table(tasklib.HarvestEnergyTask)

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

var workerTable = WorkerTable()
var harvesterTable = HarvesterTable()

function SpawnWorker(spawn)
{
    var mem = new Object()
    mem.role = 'worker'

    var source = spawn.room.find(FIND_SOURCES_ACTIVE)[0]

    mem.storageId = spawn.id
    mem.taskId = HarvestEnergyTask.Id
    mem.tableId = workerTable.Id
    mem.sourceId = source.id

    spawn.createCreep([WORK, CARRY, MOVE, MOVE], null, mem)
}

function SpawnHarvester(spawn)
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


exports.onTick = onTick
exports.spawnWorker = SpawnWorker
exports.spawnHarvester = SpawnHarvester
