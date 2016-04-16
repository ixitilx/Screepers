var imp_constants = require('constants')
var imp_task      = require('task')
var imp_table     = require('table')

var TASK_DONE = imp_constants.TASK_DONE

//////////
//
//  take energy from storage/container/spawn and store it in extensions
//  top up container hp
//
//////////

function findExtension(creep)
{
    var extensionIds = creep.getSpawn().getExtensionIds()
    var id = creep.memory.extensionId
    var currentIdx = extensionIds.indexOf(id)
    for(var idx = 0; idx < extensions.length; idx++)
    {
        var i = (idx + currentIdx) % extensionIds.length
        var ext = Game.getObjectById(extensionIds[i])
        if(ext && ext.energy < ext.energyCapacity)
        {
            creep.memory.extensionId = ext.id
            return OK
        }
    }
    return ERR_FULL
}

function takeEnergy(creep, target)
{
    if(!target)
        return ERR_INVALID_TARGET
    return target.transferEnergy(creep)
    // var freeRoom = creep.carryCapacity - creep.getCarry()
    // return target.transferEnergy(creep, freeRoom)
}

var actions =
{
    take_energy: takeEnergy,
    find_extension: findExtension
}

var targets =
{
    spawn_storage:   function(creep) { return creep.getSpawn().getBestStorage() },
    spawn_extension: function(creep) { return creep.getExtension() },
}


var taskBuilder = new imp_task.TaskBuilder(actions, targets)

var take_storage    = taskBuilder.makeTask('take_energy',  'spawn_storage')
var find_extension  = taskBuilder.makeTask('find_extension')
var store_extension = taskBuilder.makeTask('store_energy', 'spawn_extension')

var move_storage    = taskBuilder.makeTask('move1', 'spawn_storage')
var move_extension  = taskBuilder.makeTask('move1', 'spawn_extension')

var transitions = [
    [take_storage,      ERR_FULL,           find_extension],

    [find_extension,    OK,                 store_extension],
    [find_extension,    ERR_FULL,           take_storage],

    [store_extension,   ERR_FULL,           find_extension],
    [store_extension,   ERR_NOT_ENOUGH_RESOURCES, take_storage],
]

var move_transitions = [
    [take_storage,      move_storage],
    [store_extension,   move_extension]
]

imp_table.makeTable('spawn_manager', transitions, move_transitions)

function makeMemory(spawn)
{
    var memory =
    {
        role: 'spawn_manager',
        spawnId: spawn.id
    }
    return memory
}

function spawn(spawn)
{
    var memory = makeMemory(spawn)
    return spawn.createCreep([CARRY, MOVE], null, memory)
}

exports.spawn = spawn
exports.makeMemory = makeMemory
