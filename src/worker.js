taskModule = require('task')
tableModule = require('table')

Task            = taskModule.Task
TaskFromDoFunc  = taskModule.TaskFromDoFunc
Table           = tableModule.Table

function onTick(creep)
{
    var task = taskModule.GetTaskById(creep.memory.taskId);
    var status = task.do(creep);

    var table = tableModule.GetTableById(creep.memory.tableId);
    var newTask = table.Lookup(task, status)

    if(Memory.debug && Memory.debug == 1)
        console.log(creep.name + '.' + task.Name + '(' + status + ') => ' + (newTask?newTask.Name:'undefined'));

    if(task && newTask && task.Id != newTask.Id)
        creep.memory.taskId = newTask.Id
}

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
function MoveToController(creep)    { return MoveTo(creep, creep.room.controller); }

function HarvestEnergy(creep)
{
    if(_.sum(creep.carry) >= creep.carryCapacity)
        return DONE;

    source = Game.getObjectById(creep.memory.sourceId);
    return creep.harvest(source);
}

function StoreEnergy(creep)
{
    if(creep.carry.energy == 0)
        return DONE;

    storage = Game.getObjectById(creep.memory.storageId);
    return creep.transfer(storage, RESOURCE_ENERGY);
}

function UpgradeController(creep)
{
    if(creep.carry.energy == 0)
        return DONE;

    controller = creep.room.controller;
    return creep.upgradeController(controller);
}

MoveToSourceTask        = TaskFromDoFunc('MoveToSource', MoveToSource);
MoveToStorageTask       = TaskFromDoFunc('MoveToStorage', MoveToStorage);
MoveToControllerTask    = TaskFromDoFunc('MoveToController', MoveToController);
HarvestEnergyTask       = TaskFromDoFunc('HarvestEnergy', HarvestEnergy);
StoreEnergyTask         = TaskFromDoFunc('StoreEnergy', StoreEnergy);
UpgradeControllerTask   = TaskFromDoFunc('UpgradeController', UpgradeController);

function WorkerTable()
{
    table = new Table(HarvestEnergyTask);

    // Move tasks
    table.AddStateTransition(MoveToSourceTask, OK,          MoveToSourceTask);
    table.AddStateTransition(MoveToSourceTask, ERR_TIRED,   MoveToSourceTask);
    table.AddStateTransition(MoveToSourceTask, DONE,        HarvestEnergyTask);

    table.AddStateTransition(MoveToStorageTask, OK,         MoveToStorageTask);
    table.AddStateTransition(MoveToStorageTask, ERR_TIRED,  MoveToStorageTask);
    table.AddStateTransition(MoveToStorageTask, DONE,       StoreEnergyTask);

    table.AddStateTransition(MoveToControllerTask, OK,          MoveToControllerTask);
    table.AddStateTransition(MoveToControllerTask, ERR_TIRED,   MoveToControllerTask);
    table.AddStateTransition(MoveToControllerTask, DONE,        UpgradeControllerTask);

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
    var mem = new Object();
    mem.role = 'worker';

    source = spawn.room.find(FIND_SOURCES_ACTIVE)[0];

    mem.storageId = spawn.id;
    mem.taskId = HarvestEnergyTask.Id;
    mem.tableId = workerTable.Id;
    mem.sourceId = source.id;

    spawn.createCreep([WORK, CARRY, MOVE], null, mem);
}

exports.onTick = onTick;
exports.spawnWorker = SpawnWorker;
