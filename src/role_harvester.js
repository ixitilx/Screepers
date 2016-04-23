var imp_constants = require('constants')
var imp_task      = require('task')
var imp_table     = require('table')

var TASK_DONE = imp_constants.TASK_DONE

var hasHauler = function(creep) { return creep.getSource().getHaulers().size() ? OK : ERR_INVALID_TARGET }

var actions =
{
    has_hauler: hasHauler,
}

function source_drop_pos(creep)
{
    var source = creep.getSource()
    var pos = source.getDropPos()
    return new RoomPosition(pos.x, pos.y, source.room.name)
}

var targets =
{
    source:             function(creep) { return creep.getSource() },
    source_site:        function(creep) { return creep.getSource().getSite() },
    source_container:   function(creep) { return creep.getSource().getContainer() },
    source_storage:     function(creep) { return creep.getSource().getSpawn().getBestStorage() },
    source_drop_pos:    source_drop_pos,
    source_best_storage:function(creep) { return creep.getSource().getBestStorage() },
    room_controller:    function(creep) { return creep.room.controller },
}

var taskBuilder = new imp_task.TaskBuilder(actions, targets)

var drop         = taskBuilder.makeTask('drop_energy')
var has_hauler   = taskBuilder.makeTask('has_hauler')
var harvest      = taskBuilder.makeTask('harvest',      'source')
var build        = taskBuilder.makeTask('build_safe',   'source_site')
var store        = taskBuilder.makeTask('store_energy', 'source_container')
var haul         = taskBuilder.makeTask('store_energy', 'source_storage')
var repair       = taskBuilder.makeTask('repair',       'source_container')
var move_harvest = taskBuilder.makeTask('move1',        'source')
var move_build   = taskBuilder.makeTask('move3',        'source_site')
var move_store   = taskBuilder.makeTask('move1',        'source_container')
var move_haul    = taskBuilder.makeTask('move1',        'source_storage')

/*
    1. Harvest
    1.1. While harvesting - fill container
    1.2. While harvesting - repair container
    1.3. While harvesting - build container
    1.4. Normally should never got out of 1.*

    2. When full of energy (no container, no hauler)
    2.1. If there is hauler - drop cargo at drop pos
    2.2. Otherwise - haul
*/

var transitions = [
    [harvest, OK,                 repair ],
    [repair,  OK,                 harvest],
    [repair,  TASK_DONE,          store  ],
    [store,   OK,                 harvest],
    [build,   OK,                 harvest],

    [store,   ERR_FULL,           harvest],
    [store,   ERR_INVALID_TARGET, build  ],
    [repair,  ERR_INVALID_TARGET, build  ],
    [build,   ERR_INVALID_TARGET, harvest],

    [harvest,       TASK_DONE,  has_hauler],
    [has_hauler,    OK,         drop],
    [has_hauler,    ERR_INVALID_TARGET, haul],
    [drop,          OK,         harvest],

    [store,  ERR_NOT_ENOUGH_RESOURCES, harvest],
    [build,  ERR_NOT_ENOUGH_RESOURCES, harvest],
    [repair, ERR_NOT_ENOUGH_RESOURCES, harvest],
    [haul,   ERR_NOT_ENOUGH_RESOURCES, harvest],
    [drop,   ERR_NOT_ENOUGH_RESOURCES, harvest],
    
    [harvest, ERR_NOT_ENOUGH_RESOURCES, move_harvest],
]

var move_transitions = [
    [harvest, move_harvest],
    [store, move_store],
    [build, move_build],
    [haul, move_haul],
]

imp_table.makeTable('harvester', transitions, move_transitions)
