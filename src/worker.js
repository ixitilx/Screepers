taskModule = require('task')
tableModule = require('table')

Task            = taskModule.Task
TaskFromDoFunc  = taskModule.TaskFromDoFunc
Table           = tableModule.Table

function onTick(creep)
{
    var task = Task.GetById(creep.memory.taskId);
    var status = task.do(creep);

    var table = TaskTable.GetById(creep.memory.tableId);
    var newTask = table.Lookup(task, status)

    if(task.Id != newTask.Id)
        creep.memory.taskId = newTask.Id
}

//---------------------------------------------------------------------

/*
    var DONE = 100

    var ret = creep.moveTo(source);
    var ret = creep.harvest(source);
    var ret = creep.transfer(storage, RESOURCE_ENERGY)
    var ret = creep.upgradeController(controller)
*/

// task is 'processor', with 'data' stored in creep memory
// each creep with harvester role dedicated to harvest specific source

var DONE = 100;

function MoveTo(creep, dst)
{
    if(creep.pos.getRangeTo(dst)<=1)
        return DONE;
    return creep.moveTo(dst);
}

function MoveToId(creep, id)
{
    return MoveTo(creep, Game.getObjectById(id));
}

function MoveToSource(creep)        { return MoveToId(creep, creep.memory.sourceId); }
function MoveToStorage(creep)       { return MoveToId(creep, creep.memory.storageId); }
function MoveToController(creep)    { return MoveToId(creep, creep.room.controller); }

function HarvestEnergy(creep)
{
    if(_sum(creep.carry) >= creep.carryCapacity)
        return DONE;

    source = Game.getObjectById(creep.memory.sourceId);
    return creep.harvest(source);
}

function StoreEnergy(creep)
{
    if(creep.carry.energy == 0)
        return DONE;

    storage = Game.getObjectById(creep.memory.storageId);
    return creep.tranfer()
}

function UpgradeController(creep)
{
    if(creep.carry.energy == 0)
        return DONE;

    controller = creep.room.controller;
    return creep.upgradeController(controller);
}

MoveToSourceTask = TaskFromDoFunc(MoveToSource);
MoveToStorageTask = TaskFromDoFunc(MoveToStorage);
MoveToControllerTask = TaskFromDoFunc(MoveToController);
HarvestEnergyTask = TaskFromDoFunc(HarvestEnergy);
StoreEnergyTask = TaskFromDoFunc(StoreEnergy);
UpgradeControllerTask = TaskFromDoFunc(UpgradeController);

function WorkerTable()
{
    table = new Table(HarvestEnergyTask);

    // Move tasks
    table.AddStateTransition(MoveToSourceTask, OK,      MoveToSourceTask);
    table.AddStateTransition(MoveToSourceTask, DONE,    HarvestEnergyTask);

    table.AddStateTransition(MoveToStorageTask, OK,     MoveToStorageTask);
    table.AddStateTransition(MoveToStorageTask, DONE,   StoreEnergyTask);

    table.AddStateTransition(MoveToControllerTask, OK,      MoveToControllerTask);
    table.AddStateTransition(MoveToControllerTask, DONE,    UpgradeControllerTask);

    // Action tasks
    table.AddStateTransition(HarvestEnergyTask, OK,                 HarvestEnergyTask);
    table.AddStateTransition(HarvestEnergyTask, ERR_NOT_IN_RANGE,   MoveToSourceTask);
    table.AddStateTransition(HarvestEnergyTask, DONE,               MoveToStorageTask);

    table.AddStateTransition(StoreEnergyTask, OK,               StoreEnergyTask);
    table.AddStateTransition(StoreEnergyTask, ERR_NOT_IN_RANGE, StoreEnergyTask);
    table.AddStateTransition(StoreEnergyTask, DONE,             MoveToSourceTask);
    table.AddStateTransition(StoreEnergyTask, ERR_FULL,         UpgradeControllerTask);

    table.AddStateTransition(UpgradeControllerTask, OK,                         UpgradeControllerTask);
    table.AddStateTransition(UpgradeControllerTask, ERR_NOT_IN_RANGE,           MoveToControllerTask);
    table.AddStateTransition(UpgradeControllerTask, ERR_NOT_ENOUGH_RESOURCES,   HarvestEnergyTask);
    table.AddStateTransition(UpgradeControllerTask, DONE,                       MoveToStorageTask);

    return table;
}

var workerTable = WorkerTable()

function SpawnWorker(spawn)
{
    creepName = spawn.createCreep([WORK, CARRY, MOVE]);
    
    creep = Game.creeps[creepName];

    creep.role = 'Worker';

    source = spawn.room.find(FIND_ENERGY_ACTIVE)[0];

    creep.memory.storageId = spawn.Id;
    creep.memory.taskId = HarvestEnergyTask.Id;
    creep.memory.tableId = workerTable.Id;
    creep.memory.sourceId = source.Id;
}

exports.onTick = onTick;
exports.spawnWorker = SpawnWorker;
