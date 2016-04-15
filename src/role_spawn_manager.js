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
    var extensions = creep.getSpawn().getInfo().extensionIds
    if(extensions)
    {
        var id = creep.memory.extensionId
        var currentIdx = extensions.indexOf(id)
        for(var idx = currentIdx+1; idx != currentIdx; idx = (idx+1) % extension.length)
        {
            var ext = Game.getObjectById(extensions[idx])
            if(ext.energy < ext.energyCapacity)
            {
                creep.memory.extensionId = ext.id
                return OK
            }
        }
        return ERR_FULL
    }
    return ERR_INVALID_TARGET
}

function takeEnergy(creep, target)
{
    return target.transferEnergy(creep)
    // var freeRoom = creep.carryCapacity - creep.getCarry()
    // return target.transferEnergy(creep, freeRoom)
}

var actions =
{
    take_energy: takeEnergy,
    find_extension: 
}

var targets =
{
    spawn:           function(creep) { return creep.getSpawn() }
    spawn_container: function(creep) { return creep.getSpawn().getContainer() }
    spawn_storage:   function(creep) { return creep.getSpawn().getStorage() }
    spawn_extension: function(creep) { return creep.getExtension() }
}


var taskBuilder = new imp_task.TaskBuilder(actions, targets)

var take_storage    = taskBuilder.makeTask('take_energy',  'spawn_storage')
var take_container  = taskBuilder.makeTask('take_energy',  'spawn_container')
var take_spawn      = taskBuilder.makeTask('take_energy',  'spawn')
var find_extension  = taskBuilder.makeTask('find_extension', null)
var store_extension = taskBuilder.makeTask('store_energy', 'spawn_extension')

var move_storage    = taskBuilder.makeTask('move1', 'spawn_storage')
var move_container  = taskBuilder.makeTask('move1', 'spawn_container')
var move_spawn      = taskBuilder.makeTask('move1', 'spawn')
var move_extension  = taskBuilder.makeTask('move1', 'spawn_extension')

var transitions = [
    [take_storage,      ERR_INVALID_TARGET, take_container],
    [take_container,    ERR_INVALID_TARGET, take_spawn],

    [take_storage,      ERR_FULL,           find_extension],
    [take_container,    ERR_FULL,           find_extension],
    [take_spawn,        ERR_FULL,           find_extension],

    [find_extension,    OK,                 store_extension],
    [find_extension,    ERR_INVALID_TARGET, take_storage],
    [find_extension,    ERR_FULL,           take_storage],

    [store_extension,   ERR_FULL,           find_extension],
    [store_extension,   ERR_NOT_ENOUGH_RESOURCES, take_storage],
]

var move_transitions = [
    [take_storage,      move_storage],
    [take_container,    move_container],
    [take_spawn,        move_spawn],
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
    function findExtensionIds(spawn)
    {
        var exts = spawn.room.find(FIND_MY_STRUCTURES, {filter:{structureType:STURCTURE_EXTENSION}})
        return exts.map(function(ext) { return ext.id })
    }

    if(!spawn.getInfo())
    {
        Memory.spawns[spawn.id] = {
            extensionIds: findExtensionIds(spawn)
        }
    }

    var memory = makeMemory(spawn)
    return spawn.createCreep([CARRY, CARRY, MOVE], null, memory)
}

exports.spawn = spawn
exports.makeMemory = makeMemory
