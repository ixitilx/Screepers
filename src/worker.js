var taskModule = require('task')
var tableModule = require('table')

var Task = taskModule.Task
var TaskFromDoFunc = taskModule.TaskFromDoFunc
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

var DONE = 100

function MoveTo(creep, dst)
{
    if(creep.pos.getRangeTo(dst)<=1)
        return DONE
    if(Memory.autoBuildRoad && Memory.autoBuildRoad == 1)
        creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD)
    return creep.moveTo(dst)
}

function MoveToId(creep, id)
{
    return MoveTo(creep, Game.getObjectById(id))
}

function MoveToSource(creep)        { return MoveToId(creep, creep.memory.sourceId); }
function MoveToStorage(creep)       { return MoveToId(creep, creep.memory.storageId); }
function MoveToController(creep)    { return MoveTo(creep, creep.room.controller); }
function MoveToSite(creep)          
{
    if(creep.memory.siteId)
        return MoveToId(creep, creep.memory.siteId)
    return DONE
}

function HarvestEnergy(creep)
{
    if(_.sum(creep.carry) >= creep.carryCapacity)
        return DONE

    var source = Game.getObjectById(creep.memory.sourceId)
    return creep.harvest(source)
}

function StoreEnergy(creep)
{
    var storage = Game.getObjectById(creep.memory.storageId)
    if((storage.energyCapacity - storage.energy) < creep.carry.energy)
        return ERR_FULL
    return creep.transfer(storage, RESOURCE_ENERGY)
}

function UpgradeController(creep)
{
    var controller = creep.room.controller
    return creep.upgradeController(controller)
}

function Build(creep)
{
    if(creep.memory.siteId == undefined)
    {
        console.log('build:undef')
        return DONE
    }

    var site = Game.getObjectById(creep.memory.siteId)
    var ret = creep.build(site)
    if(ret == ERR_INVALID_TARGET)
    {
        console.log('build:inval')
        delete creep.memory.siteId
    }
    return ret
}

var MoveToSourceTask        = TaskFromDoFunc('MoveToSource',        MoveToSource)
var MoveToStorageTask       = TaskFromDoFunc('MoveToStorage',       MoveToStorage)
var MoveToControllerTask    = TaskFromDoFunc('MoveToController',    MoveToController)
var MoveToSiteTask          = TaskFromDoFunc('MoveToSite',          MoveToSite)

var HarvestEnergyTask       = TaskFromDoFunc('HarvestEnergy',       HarvestEnergy)
var StoreEnergyTask         = TaskFromDoFunc('StoreEnergy',         StoreEnergy)
var UpgradeControllerTask   = TaskFromDoFunc('UpgradeController',   UpgradeController)
var BuildTask               = TaskFromDoFunc('Build',               Build)

function WorkerTable()
{
    var table = new Table(HarvestEnergyTask)

    // Main logic
    table.AddStateTransition(HarvestEnergyTask,     DONE,       StoreEnergyTask)
    table.AddStateTransition(StoreEnergyTask,       ERR_FULL,   BuildTask)
    table.AddStateTransition(BuildTask,             DONE,       UpgradeControllerTask)
    
    table.AddStateTransition(StoreEnergyTask,       ERR_NOT_ENOUGH_RESOURCES, HarvestEnergyTask)
    table.AddStateTransition(BuildTask,             ERR_NOT_ENOUGH_RESOURCES, HarvestEnergyTask)
    table.AddStateTransition(UpgradeControllerTask, ERR_NOT_ENOUGH_RESOURCES, HarvestEnergyTask)

    // Doing fine
    table.AddStateTransition(HarvestEnergyTask,     OK, HarvestEnergyTask)
    table.AddStateTransition(StoreEnergyTask,       OK, StoreEnergyTask)
    table.AddStateTransition(UpgradeControllerTask, OK, UpgradeControllerTask)
    table.AddStateTransition(BuildTask,             OK, BuildTask)

    // Move around
    table.addMoveTransition(HarvestEnergyTask, MoveToSourceTask)
    table.addMoveTransition(StoreEnergyTask, MoveToStorageTask)
    table.addMoveTransition(BuildTask, MoveToSiteTask)
    table.addMoveTransition(UpgradeControllerTask, MoveToControllerTask)

    return table
}

function HarvesterTable()
{
    var table = new Table(HarvestEnergyTask)

    // Main logic
    table.AddStateTransition(HarvestEnergyTask,     DONE, StoreEnergyTask)
    table.AddStateTransition(StoreEnergyTask,       ERR_FULL, HarvestEnergyTask)
    table.AddStateTransition(StoreEnergyTask,       ERR_NOT_ENOUGH_RESOURCES, HarvestEnergyTask)

    // Move
    table.AddStateTransition(MoveToSourceTask,      DONE, HarvestEnergyTask)
    table.AddStateTransition(MoveToStorageTask,     DONE, StoreEnergyTask)

    // Main task not in range
    table.AddStateTransition(HarvestEnergyTask,     ERR_NOT_IN_RANGE, MoveToSourceTask)
    table.AddStateTransition(StoreEnergyTask,       ERR_NOT_IN_RANGE, MoveToStorageTask)

    // Suppress 'missing transition' errors
    // Doing fine, continue same task
    table.AddStateTransition(MoveToSourceTask,      OK, MoveToSourceTask)
    table.AddStateTransition(MoveToStorageTask,     OK, MoveToStorageTask)
    table.AddStateTransition(HarvestEnergyTask,     OK, HarvestEnergyTask)
    table.AddStateTransition(StoreEnergyTask,       OK, StoreEnergyTask)

    // Move-tired
    table.AddStateTransition(MoveToSourceTask,      ERR_TIRED, MoveToSourceTask)
    table.AddStateTransition(MoveToStorageTask,     ERR_TIRED, MoveToStorageTask)

    // Move-no-path
    table.AddStateTransition(MoveToSourceTask,      ERR_NO_PATH, MoveToSourceTask)
    table.AddStateTransition(MoveToStorageTask,     ERR_NO_PATH, MoveToStorageTask)

    // Busy
    table.AddStateTransition(HarvestEnergyTask,     ERR_BUSY, HarvestEnergyTask)

    return table
}

var workerTable = WorkerTable()
var harvesterTable = HarvesterTable()

function SpawnWorker(spawn)
{
    var mem = new Object()
    mem.role = 'worker'

    source = spawn.room.find(FIND_SOURCES_ACTIVE)[0]

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

    source = spawn.room.find(FIND_SOURCES_ACTIVE)[0]

    mem.storageId = '570a80e8d21b022c2c7e8ada'
    mem.taskId = HarvestEnergyTask.Id
    mem.tableId = harvesterTable.Id
    mem.sourceId = source.id

    spawn.createCreep([WORK, CARRY, MOVE, MOVE], null, mem)
}


exports.onTick = onTick
exports.spawnWorker = SpawnWorker
exports.spawnHarvester = SpawnHarvester
