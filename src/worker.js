var imp_constants = require('constants')
var imp_task      = require('task')
var imp_table     = require('table')

var TASK_DONE = imp_constants.TASK_DONE

function storeEnergy(creep, target)
{
    return creep.transfer(target, RESOURCE_ENERGY)
}

function harvestEnergy(creep, target)
{
    if(creep.getCarry() >= creep.carryCapacity)
        return TASK_DONE
    return creep.harvest(target)
}

function repair(creep, target)
{
    if(!target)
        return TASK_DONE
    var missingHits = target.hitsMax - target.hits
    var repairHits = creep.getBody() * Creep.prototype.bodyCost[WORK]
    if(repairHits > missingHits)
        return TASK_DONE
    return creep.repair(target)
}

function upgrade(creep, target)
{
    return creep.upgradeController(target)
}

var actions =
{
    move0:      imp_task.makeMoveFunction(0),
    move1:      imp_task.makeMoveFunction(1),
    move3:      imp_task.makeMoveFunction(3),
    store:      storeEnergy,
    repair:     repair,
    harvest:    harvestEnergy,
    upgrade:    upgrade,
}

var targets =
{
    source:     function(creep) { return creep.getSource() },
    site:       function(creep) { return creep.getSource().getSite() },
    container:  function(creep) { return creep.getSource().getContainer() },
    storage:    function(creep) { return creep.getSource().getStorage() },
    controller: function(creep) { return creep.room.controller }
}

var taskBuilder = new imp_task.TaskBuilder(targets, actions)

var harvest      = taskBuilder.makeTask('harvest',  'source')
var build        = taskBuilder.makeTask('build',    'site')
var store        = taskBuilder.makeTask('store',    'container')
var haul         = taskBuilder.makeTask('store',    'storage')
var repair       = taskBuilder.makeTask('repair',   'container')
var upgrade      = taskBuilder.makeTask('upgrade',  'controller')

var move_harvest = taskBuilder.makeTask('move1',    'source')
var move_build   = taskBuilder.makeTask('move3',    'site')
var move_store   = taskBuilder.makeTask('move0',    'container')
var move_haul    = taskBuilder.makeTask('move1',    'storage')
var move_upgrade = taskBuilder.makeTask('move3',    'controller')

var transitions = [
    [harvest, OK,                 repair ],
    [repair,  OK,                 harvest],
    [repair,  TASK_DONE,          store  ],
    [store,   OK,                 harvest],

    [store,   ERR_FULL,           harvest],
    [store,   ERR_INVALID_TARGET, build  ],
    [repair,  ERR_INVALID_TARGET, build  ],
    [build,   ERR_INVALID_TARGET, harvest],

    [harvest, TASK_DONE, haul],
    [haul,    ERR_FULL,  upgrade],

    [store,  ERR_NOT_ENOUGH_RESOURCES, harvest],
    [build,  ERR_NOT_ENOUGH_RESOURCES, harvest],
    [repair, ERR_NOT_ENOUGH_RESOURCES, harvest],
    [haul,   ERR_NOT_ENOUGH_RESOURCES, harvest],
    [upgrade, ERR_NOT_ENOUGH_RESOURCES, harvest],

    [harvest, ERR_NOT_ENOUGH_RESOURCES, move_harvest],
]

var move_transitions = [
    [harvest,   move_harvest],
    [store,     move_store],
    [build,     move_build],
    [haul,      move_haul],
    [upgrade,   move_upgrade],
]

imp_table.makeTable('worker', transitions, move_transitions)

function makeMemory(spawn)
{
    var source = spawn.room.find(FIND_SOURCES)[0]
    var memory =
    {
        role: 'worker',
        sourceId: source.id
    }
    return memory
}

function spawn(spawn)
{
    var memory = makeMemory(spawn)
    return spawn.createCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], null, memory)
}

exports.spawn = spawn
exports.makeMemory = makeMemory
