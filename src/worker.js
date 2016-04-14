var imp_constants = require('constants')
var imp_task      = require('task')
var imp_table     = require('table')

var TASK_DONE = imp_constants.TASK_DONE

var taskBuilder = new imp_task.TaskBuilder(actions, targets)

var harvest      = taskBuilder.makeTask('harvest',      'source')
var build        = taskBuilder.makeTask('build',        'source_site')
var store        = taskBuilder.makeTask('store_energy', 'source_container')
var haul         = taskBuilder.makeTask('store_energy', 'source_storage')
var repair       = taskBuilder.makeTask('repair',       'source_container')
var move_harvest = taskBuilder.makeTask('move1',        'source')
var move_build   = taskBuilder.makeTask('move3',        'source_site')
var move_store   = taskBuilder.makeTask('move0',        'source_container')
var move_haul    = taskBuilder.makeTask('move1',        'source_storage')

var upgrade      = taskBuilder.makeTask('upgrade',      'room_controller')
var move_upgrade = taskBuilder.makeTask('move3',        'room_controller')

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
