taskModule = require('task')
tableModule = require('table')

Task            = taskModule.Task
TaskFromDoFunc  = taskModule.TaskFromDoFunc
Table           = tableModule.Table

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

    source = Game.getObjectById(creep.memory.sourceId)
    return creep.harvest(source)
}

function StoreEnergy(creep)
{
    storage = Game.getObjectById(creep.memory.storageId)
    return creep.transfer(storage, RESOURCE_ENERGY)
}

function UpgradeController(creep)
{
    controller = creep.room.controller
    return creep.upgradeController(controller)
}

function Build(creep)
{
    if(creep.memory.siteId == undefined)
    {
        console.log('build:undef')
        return DONE
    }

    site = Game.getObjectById(creep.memory.siteId)
    var ret = creep.build(site)
    if(ret == ERR_INVALID_TARGET)
    {
        console.log('build:inval')
        delete creep.memory.siteId
    }
    return DONE
}

MoveToSourceTask        = TaskFromDoFunc('MoveToSource',        MoveToSource)
MoveToStorageTask       = TaskFromDoFunc('MoveToStorage',       MoveToStorage)
MoveToControllerTask    = TaskFromDoFunc('MoveToController',    MoveToController)
MoveToSiteTask          = TaskFromDoFunc('MoveToSite',          MoveToSite)

HarvestEnergyTask       = TaskFromDoFunc('HarvestEnergy',       HarvestEnergy)
StoreEnergyTask         = TaskFromDoFunc('StoreEnergy',         StoreEnergy)
UpgradeControllerTask   = TaskFromDoFunc('UpgradeController',   UpgradeController)
BuildTask               = TaskFromDoFunc('Build',               Build)

function WorkerTable()
{
    table = new Table(HarvestEnergyTask)

    // Main logic
    table.AddStateTransition(HarvestEnergyTask,     DONE,       StoreEnergyTask)
    table.AddStateTransition(StoreEnergyTask,       ERR_FULL,   BuildTask)
    table.AddStateTransition(BuildTask,             DONE,       UpgradeControllerTask)
    
    table.AddStateTransition(StoreEnergyTask,       ERR_NOT_ENOUGH_RESOURCES, HarvestEnergyTask)
    table.AddStateTransition(BuildTask,             ERR_NOT_ENOUGH_RESOURCES, HarvestEnergyTask)
    table.AddStateTransition(UpgradeControllerTask, ERR_NOT_ENOUGH_RESOURCES, HarvestEnergyTask)

    // Move
    table.AddStateTransition(MoveToSourceTask,      DONE, HarvestEnergyTask)
    table.AddStateTransition(MoveToStorageTask,     DONE, StoreEnergyTask)
    table.AddStateTransition(MoveToControllerTask,  DONE, UpgradeControllerTask)
    table.AddStateTransition(MoveToSiteTask,        DONE, BuildTask)

    // Main task not in range
    table.AddStateTransition(HarvestEnergyTask,     ERR_NOT_IN_RANGE, MoveToSourceTask)
    table.AddStateTransition(StoreEnergyTask,       ERR_NOT_IN_RANGE, MoveToStorageTask)
    table.AddStateTransition(UpgradeControllerTask, ERR_NOT_IN_RANGE, MoveToControllerTask)
    table.AddStateTransition(BuildTask,             ERR_NOT_IN_RANGE, MoveToSiteTask)

    // Suppress 'missing transition' errors
    // Doing fine, continue same task
    table.AddStateTransition(MoveToSourceTask,      OK, MoveToSourceTask)
    table.AddStateTransition(MoveToStorageTask,     OK, MoveToStorageTask)
    table.AddStateTransition(MoveToControllerTask,  OK, MoveToControllerTask)
    table.AddStateTransition(MoveToSiteTask,        OK, MoveToSiteTask)

    table.AddStateTransition(HarvestEnergyTask,     OK, HarvestEnergyTask)
    table.AddStateTransition(StoreEnergyTask,       OK, StoreEnergyTask)
    table.AddStateTransition(UpgradeControllerTask, OK, UpgradeControllerTask)
    table.AddStateTransition(BuildTask,             OK, BuildTask)

    // Move-tired
    table.AddStateTransition(MoveToSourceTask,      ERR_TIRED, MoveToSourceTask)
    table.AddStateTransition(MoveToStorageTask,     ERR_TIRED, MoveToStorageTask)
    table.AddStateTransition(MoveToControllerTask,  ERR_TIRED, MoveToControllerTask)
    table.AddStateTransition(MoveToSiteTask,        ERR_TIRED, MoveToSiteTask)

    // Move-no-path
    table.AddStateTransition(MoveToSourceTask,      ERR_NO_PATH, MoveToSourceTask)
    table.AddStateTransition(MoveToStorageTask,     ERR_NO_PATH, MoveToStorageTask)
    table.AddStateTransition(MoveToControllerTask,  ERR_NO_PATH, MoveToControllerTask)
    table.AddStateTransition(MoveToSiteTask,        ERR_NO_PATH, MoveToSiteTask)

    // Busy
    table.AddStateTransition(HarvestEnergyTask,     ERR_BUSY, HarvestEnergyTask)

    return table
}

function HarvesterTable()
{
    table = new Table(HarvestEnergyTask)

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

    spawn.createCreep([WORK, CARRY, MOVE], null, mem)
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

    spawn.createCreep([WORK, CARRY, MOVE], null, mem)
}


exports.onTick = onTick
exports.spawnWorker = SpawnWorker
exports.spawnHarvester = SpawnHarvester
